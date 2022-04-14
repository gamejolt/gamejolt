import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { markRaw, reactive } from 'vue';
import { arrayRemove, arrayUnique } from '../../../utils/array';
import { CancelToken } from '../../../utils/cancel-token';
import { debounce, sleep } from '../../../utils/utils';
import { importNoSSR } from '../../code-splitting';
import { Navigate } from '../../navigate/navigate.service';
import { SettingStreamDesktopVolume } from '../../settings/settings.service';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';
import {
	createFiresideRTCChannel,
	destroyChannel,
	FiresideRTCChannel,
	joinChannel,
	setChannelToken,
} from './channel';
import {
	createFiresideRTCProducer,
	destroyFiresideRTCProducer,
	FiresideRTCProducer,
} from './producer';
import {
	createRemoteFiresideRTCUser,
	FiresideRTCUser,
	FiresideVideoPlayStateStopped,
	setUserDesktopAudioVolume,
	setUserHasDesktopAudio,
	setUserHasMicAudio,
	setUserHasVideo,
	setVideoPlayback,
	stopAudioPlayback,
	stopDesktopAudioPlayback,
	updateVolumeLevel,
} from './user';

const AgoraRTCLazy = importNoSSR(async () => (await import('agora-rtc-sdk-ng')).default);

export const FiresideRTCKey = Symbol();

export interface FiresideRTCHost {
	user: User;
	// TODO(big-pp-event) rename this to something that indicates you need permission to view them.
	isUnlisted: boolean;
	isLive: boolean;
	uids: number[];
}

/**
 * Credentials needed to connect and interact with Agora.
 */
export interface AgoraStreamingInfo {
	appId: string;
	streamingUid: number;
	videoChannelName: string;
	videoToken: string;
	chatChannelName: string;
	chatToken: string;
}

type Options = { isMuted?: boolean };

export class FiresideRTC {
	constructor(
		public readonly fireside: Fireside,
		public readonly userId: number | null,
		public readonly appId: string,
		public readonly streamingUid: number,
		public readonly videoChannelName: string,
		public videoToken: string,
		public readonly chatChannelName: string,
		public chatToken: string,
		public readonly hosts: FiresideRTCHost[],
		public readonly listableHostIds: number[],
		{ isMuted }: Options
	) {
		this.isMuted = isMuted ?? false;
	}

	readonly isMuted;

	generation = new CancelToken();

	/**
	 *  Safari keeps [AgoraRTC.onAudioAutoplayFailed] looping, so I'm assigning
	 *  to this to ensure we only trigger the failure callback once.
	 */
	_handledAutoplayError = false;
	shouldShowMutedIndicator = false;

	// These channels will get created immediately in the setup.
	videoChannel!: FiresideRTCChannel;
	chatChannel!: FiresideRTCChannel;

	/**
	 * The list of FiresideRTCUsers that currently have an agora stream published.
	 */
	readonly _remoteStreamingUsers: FiresideRTCUser[] = [];
	focusedUser: FiresideRTCUser | null = null;

	videoPaused = false;
	volumeLevelInterval: NodeJS.Timer | null = null;
	shouldShowVideoThumbnails = false;
	shouldShowVideoStats = false;
	producer: FiresideRTCProducer | null = null;

	_desktopVolume = 1;

	get desktopVolume() {
		return this._desktopVolume;
	}

	setupFinalized = false;
	finalizeSetupFn: (() => void) | null = null;

	log(message: any, ...optionalParams: any[]) {
		console.log('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	logWarning(message: any, ...optionalParams: any[]) {
		console.warn('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	logError(message: any, ...optionalParams: any[]) {
		console.error('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	/**
	 * The local [FiresideRTCUser] if they're currently streaming.
	 */
	localUser: FiresideRTCUser | null = null;

	get role() {
		return this.fireside.role;
	}

	/**
	 * Remote users + the local user prepended if it is set.
	 * Note: the local user is set if they are currently streaming.
	 */
	get _allStreamingUsers() {
		// If we are streaming from a different tab then we will already have a remote user
		// correlating to the same gj user our local user correlates to.
		// This is apparently intended, but i don't know why.
		return this.localUser // formatting
			? [this.localUser, ...this._remoteStreamingUsers]
			: [...this._remoteStreamingUsers];
	}

	get listableStreamingUsers() {
		return this._allStreamingUsers.filter(rtcUser => !rtcUser.isUnlisted);
	}

	get isEveryRemoteListableUsersMuted() {
		// Check against _remoteStreamingUsers because we want to exclude the local user from this check.
		return this._remoteStreamingUsers.every(
			rtcUser => rtcUser.isUnlisted || rtcUser.micAudioMuted
		);
	}

	/**
	 * If the current user is currently streaming in this fireside. This will
	 * only return valid data once everything gets subscribed to.
	 */
	get isPersonallyStreaming() {
		return this.localUser !== null;
	}

	get shouldShowVolumeControls() {
		return (
			this.focusedUser?.hasDesktopAudio === true &&
			this.focusedUser?.hasVideo === true &&
			!this.isFocusingMe
		);
	}

	get isFocusingMe() {
		return this.focusedUser && this.localUser && this.focusedUser.uid === this.localUser.uid;
	}

	get isPoorNetworkQuality() {
		return this.videoChannel.isPoorNetworkQuality || this.chatChannel.isPoorNetworkQuality;
	}
}

export function createFiresideRTC(
	fireside: Fireside,
	userId: number | null,
	agoraStreamingInfo: AgoraStreamingInfo,
	hosts: FiresideRTCHost[],
	listableHostIds: number[],
	options: Options = {}
) {
	const rtc = reactive(
		new FiresideRTC(
			fireside,
			userId,
			agoraStreamingInfo.appId,
			agoraStreamingInfo.streamingUid,
			agoraStreamingInfo.videoChannelName,
			agoraStreamingInfo.videoToken,
			agoraStreamingInfo.videoToken,
			agoraStreamingInfo.chatToken,
			hosts,
			listableHostIds,
			options
		)
	) as FiresideRTC;

	// Initialize based on their pref.
	setRTCDesktopVolume(rtc, SettingStreamDesktopVolume.get());

	_setup(rtc);
	return rtc;
}

export async function destroyFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(destroy)');

	// Don't assign a new one so that we stay in a canceled state.
	rtc.generation.cancel();

	if (rtc.producer) {
		// TODO(big-pp-event) we don't stop streaming here. is this intentional?
		// EDIT: looks like this is done in destroyChannel calls below.
		// TODO(big-pp-event) This won't call set-is-streaming to false tho.
		destroyFiresideRTCProducer(rtc.producer);
		rtc.producer = null;
	}

	try {
		await Promise.all(
			rtc._allStreamingUsers.map(user =>
				Promise.all([
					setVideoPlayback(user, new FiresideVideoPlayStateStopped()),
					stopDesktopAudioPlayback(user),
					stopAudioPlayback(user),
				])
			)
		);
	} catch (e) {
		rtc.logWarning('Error while stopping playback. Ignoring.');
		rtc.logWarning(e);
	}

	const { videoChannel, chatChannel } = rtc;

	try {
		await Promise.all([destroyChannel(videoChannel), destroyChannel(chatChannel)]);
	} catch (e) {
		rtc.logError(`Failed to destroy the Fireside RTC. Reloading...`, e);
		// reload the page, anything we do now is no longer reliable.
		Navigate.reload();
		return;
	}

	if (rtc.volumeLevelInterval !== null) {
		clearInterval(rtc.volumeLevelInterval);
		rtc.volumeLevelInterval = null;
	}

	rtc.focusedUser = null;
	rtc.hosts.splice(0);
}

export async function recreateFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(recreate)');
	// TODO(big-pp-event) this will not end up calling set-is-streaming false,
	// and will not start streaming again. Is this a bug?
	await destroyFiresideRTC(rtc);
	return _setup(rtc);
}

export function setHosts(rtc: FiresideRTC, newHosts: FiresideRTCHost[]) {
	rtc.hosts.splice(0);
	rtc.hosts.push(...newHosts);
}

export function setListableHostIds(rtc: FiresideRTC, listableHostIds: number[]) {
	rtc.listableHostIds.splice(0);
	rtc.listableHostIds.push(...listableHostIds);
}

/**
 * Renews specifically for audience tokens. If they're a host, this will
 * essentially be ignored.
 */
export async function applyAudienceRTCTokens(
	rtc: FiresideRTC,
	videoToken: string,
	chatToken: string
) {
	if (rtc.role?.canStream) {
		return;
	}

	return await applyRTCTokens(rtc, videoToken, chatToken);
}

/**
 * These tokens may either be audience tokens or host streaming tokens.
 */
export async function applyRTCTokens(rtc: FiresideRTC, videoToken: string, chatToken: string) {
	rtc.log('Trace(renewToken)');

	rtc.log(`Renewing tokens.`);
	rtc.videoToken = videoToken;
	rtc.chatToken = chatToken;

	const isVideoDisconnected = rtc.videoChannel.isDisconnected;
	const isAudioDisconnected = rtc.chatChannel.isDisconnected;

	// If only one of the clients is fully disconnected, just nuke em both and retry.
	if (isVideoDisconnected !== isAudioDisconnected) {
		rtc.logError(
			`Only one of the clients (video or audio) is connected. Recreating both to get them in sync`
		);
		recreateFiresideRTC(rtc);
		return;
	}

	if (isVideoDisconnected || isAudioDisconnected) {
		rtc.log(`Got new tokens. Applying by joining...`);
		await _join(rtc);
	} else {
		rtc.log(`Got new tokens. Applying by renewing...`);
		await Promise.all([
			setChannelToken(rtc.videoChannel, videoToken),
			setChannelToken(rtc.chatChannel, chatToken),
		]);
	}
}

async function _setup(rtc: FiresideRTC) {
	rtc.log('Trace(setup)');

	const gen = new CancelToken();
	rtc.generation.cancel();
	rtc.generation = gen;

	await _createChannels(rtc);
	_createProducer(rtc);

	for (let i = 0; i < 5; i++) {
		try {
			await _join(rtc);
			break;
		} catch (e) {
			rtc.logError('Failed to join');
			rtc.logError(e);
			await sleep(2000);
			gen.assert();
			rtc.log('Retrying...');
		}
	}
}

/**
 * Before doing some stuff (like choosing the best initial stream to show) we
 * want some of the system to initialize (subscribe to hosts and stuff). This
 * allows us to do a sort of delayed setup.
 */
function _finalizeSetup(rtc: FiresideRTC) {
	if (rtc.setupFinalized) {
		// Run the debounced finalizeSetupFn again if the focusedUser doesn't
		// exist or match any of our current hosts.
		if (!rtc.focusedUser && rtc.finalizeSetupFn) {
			rtc.finalizeSetupFn?.();
		}
		return;
	}

	rtc.finalizeSetupFn ??= debounce(() => {
		chooseFocusedRTCUser(rtc);

		if (!rtc.setupFinalized) {
			rtc.setupFinalized = true;
			rtc.log(`Setup finalized.`);
		}
	}, 500);

	rtc.log(`Debouncing finalize setup.`);
	rtc.finalizeSetupFn?.();
}

async function _createChannels(rtc: FiresideRTC) {
	rtc.log('Trace(createChannels)');

	const AgoraRTC = await AgoraRTCLazy;
	(AgoraRTC as any)?.setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);

	// If we fail to autoplay with desktop audio, pause the stream so we have to
	// interact with the DOM to play it.
	AgoraRTC.onAudioAutoplayFailed = async () => {
		// Pause the video if this is our first time doing this.
		if (!rtc._handledAutoplayError) {
			rtc._handledAutoplayError = true;
			rtc.videoPaused = true;
			return;
		}

		// If this was triggered a second time, we should indicate that the
		// video is currently playing in a muted state.
		//
		// We need to do this because Safari doesn't always accept our
		// click-to-play interaction as enough to autoplay audio.
		rtc.shouldShowMutedIndicator = true;

		// Any document interaction seems sufficient to cause the audio to play
		// once all the stream subscriptions are active.
		window.document.addEventListener(
			'mousedown',
			() => {
				rtc._handledAutoplayError = false;
				rtc.shouldShowMutedIndicator = false;
			},
			{
				once: true,
				capture: true,
				passive: true,
			}
		);
	};

	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);

	rtc.videoChannel = await createFiresideRTCChannel(rtc, rtc.videoChannelName, rtc.videoToken, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('Got user published (video channel)');

			const user = _findOrAddRemoteUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.remoteVideoUser = markRaw(remoteUser);

			if (mediaType === 'video') {
				setUserHasVideo(user, true);
			} else {
				setUserHasDesktopAudio(user, true);
			}

			_finalizeSetup(rtc);
		},
		onTrackUnpublish(remoteUser, mediaType) {
			rtc.log('Got user unpublished (video channel)');

			// Ideally we'd like to check _remoteStreamingUsers but I don't trust Agora
			// to actually emit these events only for remote users.
			// If it gets emitted for a local user we'll throw.
			const user = rtc._allStreamingUsers.find(i => i.uid === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			// Safeguard against Agora emitting these events for local users.
			if (user.isLocal) {
				throw new Error('Expected to be handling remote users here');
			}

			if (mediaType === 'video') {
				setUserHasVideo(user, false);
			} else {
				setUserHasDesktopAudio(user, false);
			}

			_removeUserIfNeeded(rtc, user);
		},
	});

	rtc.chatChannel = await createFiresideRTCChannel(rtc, rtc.chatChannelName, rtc.chatToken, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('got user published (audio chat channel)');

			if (mediaType !== 'audio') {
				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const user = _findOrAddRemoteUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.remoteChatUser = markRaw(remoteUser);
			setUserHasMicAudio(user, true);

			_finalizeSetup(rtc);
		},
		onTrackUnpublish(remoteUser, mediaType) {
			rtc.log('Got user unpublished (audio channel)');

			// This should never trigger.
			if (mediaType !== 'audio') {
				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			// Ideally we'd like to check _remoteStreamingUsers but I don't trust Agora
			// to actually emit these events only for remote users.
			// If it gets emitted for a local user we'll throw.
			const user = rtc._allStreamingUsers.find(i => i.uid === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			// Safeguard against Agora emitting these events for local users.
			if (user.isLocal) {
				throw new Error('Expected to be handling remote users here');
			}

			setUserHasMicAudio(user, false);
			_removeUserIfNeeded(rtc, user);
		},
	});
}

function _createProducer(rtc: FiresideRTC) {
	if (rtc.role?.canStream !== true) {
		return;
	}

	rtc.producer = createFiresideRTCProducer(rtc);
}

async function _join(rtc: FiresideRTC) {
	rtc.log('Trace(join)');

	await Promise.all([
		joinChannel(rtc.videoChannel, rtc.videoToken),
		joinChannel(rtc.chatChannel, rtc.chatToken),
	]);
}

export function chooseFocusedRTCUser(rtc: FiresideRTC) {
	// We only choose a new focused user if the current one is unset or is unlisted.
	if (rtc.focusedUser) {
		// Unfocus an unlisted focused user.
		if (rtc.focusedUser.isUnlisted) {
			rtc.focusedUser = null;
		} else {
			return;
		}
	}

	let bestUser: FiresideRTCUser | null = null;
	let bestScore = -1;

	for (const user of rtc.listableStreamingUsers) {
		const score =
			(user.hasVideo ? 4 : 0) + (user.hasMicAudio ? 2 : 0) + (user.hasDesktopAudio ? 1 : 0);
		if (score > bestScore) {
			bestUser = user;
			bestScore = score;
		}
	}

	rtc.focusedUser = bestUser;
}

function _findOrAddRemoteUser(rtc: FiresideRTC, remoteUser: IAgoraRTCRemoteUser) {
	if (typeof remoteUser.uid !== 'number') {
		rtc.logWarning('Expected remote user uid to be numeric');
		return null;
	}

	// We are checking _allStreamingUsers here just as a safeguard against Agora.
	// if we don't use _allStreamingUsers we'll end up inserting the local user
	// into _remoteStreamingUsers.
	let user = rtc._allStreamingUsers.find(i => i.uid === remoteUser.uid);

	if (!user) {
		user = createRemoteFiresideRTCUser(rtc, remoteUser.uid);
		rtc._remoteStreamingUsers.push(user);
	} else if (user.isLocal) {
		throw new Error('Expected to be handling remote users here');
	}

	return user;
}

function _removeUserIfNeeded(rtc: FiresideRTC, user: FiresideRTCUser) {
	// We remove once all their tracks are gone.
	if (user.hasVideo || user.hasDesktopAudio || user.hasMicAudio) {
		return;
	}

	user.remoteVideoUser = null;
	user.remoteChatUser = null;

	arrayRemove(rtc._remoteStreamingUsers, i => i === user);

	if (rtc.focusedUser?.uid === user.uid) {
		rtc.focusedUser = null;
		chooseFocusedRTCUser(rtc);
	}
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	// Checking against _allStreamingUsers allows us to update the local user's audio levels as well.
	for (const user of rtc._allStreamingUsers) {
		updateVolumeLevel(user);
	}
}

export function setRTCDesktopVolume(rtc: FiresideRTC, percent: number) {
	percent = Math.min(1, Math.max(0, percent));

	rtc._desktopVolume = percent;
	SettingStreamDesktopVolume.set(percent);

	if (rtc.focusedUser) {
		setUserDesktopAudioVolume(rtc.focusedUser, percent);
	}
}
