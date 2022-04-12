import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { markRaw, reactive, toRaw } from 'vue';
import { arrayRemove } from '../../../utils/array';
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
	isUnlisted: boolean;
	uids: number[];
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

	readonly _users: FiresideRTCUser[] = [];
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

	get users() {
		// We put the local user first if they're currently streaming.

		// TODO(big-pp-event): we have a bug here. we might already have a remote user represeting our local user.
		// what happens if you try to start streaming when youre already streaming in a different tab?
		// it'll add the local user anyways and then we'll have two users for yourself (one with the remote uid and one local)
		// Also - is the comment above outdated? we don't seem to check if the localUser is streaming,
		// but from what I can tell it IS being initialized even during preview.
		return Object.freeze([...(this.localUser ? [this.localUser] : []), ...this._users]);
	}

	get listableUsers() {
		return this.users.filter(user => !user.isUnlisted);
	}

	get isEveryRemoteListableUsersMuted() {
		// Check against _users because we want to exclude the local user from this check.
		return this._users.every(rtcUser => rtcUser.isUnlisted || rtcUser.micAudioMuted);
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
		return this.focusedUser === this.localUser;
	}

	get isPoorNetworkQuality() {
		return this.videoChannel.isPoorNetworkQuality || this.chatChannel.isPoorNetworkQuality;
	}
}

export function createFiresideRTC(
	fireside: Fireside,
	userId: number | null,
	appId: string,
	streamingUid: number,
	videoChannelName: string,
	videoToken: string,
	chatChannelName: string,
	chatToken: string,
	hosts: FiresideRTCHost[],
	listableHostIds: number[],
	options: Options = {}
) {
	const rtc = reactive(
		new FiresideRTC(
			fireside,
			userId,
			appId,
			streamingUid,
			videoChannelName,
			videoToken,
			chatChannelName,
			chatToken,
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
		destroyFiresideRTCProducer(rtc.producer);
		rtc.producer = null;
	}

	try {
		await Promise.all(
			rtc.users.map(user =>
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
	await destroyFiresideRTC(rtc);
	return _setup(rtc);
}

/**
 * Renews specifically for audience tokens. If they're a host, this will
 * essentially be ignored.
 */
export async function renewRTCAudienceTokens(
	rtc: FiresideRTC,
	videoToken: string,
	chatToken: string
) {
	if (rtc.role?.canStream) {
		return;
	}

	return await renewRTCTokens(rtc, videoToken, chatToken);
}

export async function renewRTCTokens(rtc: FiresideRTC, videoToken: string, chatToken: string) {
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

			const user = _findOrAddUser(rtc, remoteUser);
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

			const user = rtc.users.find(i => i.uid === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
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

			const user = _findOrAddUser(rtc, remoteUser);
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

			const user = rtc.users.find(i => i.uid === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
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
	// We only choose a new focused user if there isn't one currently set.
	if (rtc.focusedUser) {
		return;
	}

	let bestUser: FiresideRTCUser | null = null;
	let bestScore = -1;

	for (const user of rtc.listableUsers) {
		const score =
			(user.hasVideo ? 4 : 0) + (user.hasMicAudio ? 2 : 0) + (user.hasDesktopAudio ? 1 : 0);
		if (score > bestScore) {
			bestUser = user;
			bestScore = score;
		}
	}

	rtc.focusedUser = bestUser;
}

function _findOrAddUser(rtc: FiresideRTC, remoteUser: IAgoraRTCRemoteUser) {
	if (typeof remoteUser.uid !== 'number') {
		rtc.logWarning('Expected remote user uid to be numeric');
		return null;
	}

	// This will find the local user as well as remote users.
	let user = rtc.users.find(i => i.uid === remoteUser.uid);

	if (!user) {
		user = new FiresideRTCUser(rtc, remoteUser.uid);
		rtc._users.push(user);
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

	arrayRemove(rtc._users, i => i === user);

	if (toRaw(rtc.focusedUser) === toRaw(user)) {
		rtc.focusedUser = null;
		chooseFocusedRTCUser(rtc);
	}
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	for (const user of rtc.users) {
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
