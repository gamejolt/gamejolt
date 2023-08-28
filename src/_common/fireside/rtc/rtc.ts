import type { IAgoraRTC, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Ref, markRaw, reactive } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { CancelToken } from '../../../utils/cancel-token';
import { debounce, sleep } from '../../../utils/utils';
import { BackgroundModel } from '../../background/background.model';
import { importNoSSR } from '../../code-splitting';
import { Navigate } from '../../navigate/navigate.service';
import { UserModel } from '../../user/user.model';
import { FiresideModel } from '../fireside.model';
import {
	FiresideRTCChannel,
	createFiresideRTCChannel,
	destroyChannel,
	joinChannel,
	setChannelToken,
} from './channel';
import { FiresideRTCProducer, cleanupFiresideRTCProducer, updateSetIsStreaming } from './producer';
import {
	FiresideRTCUser,
	FiresideVideoPlayStateStopped,
	cleanupFiresideRTCUser,
	createRemoteFiresideRTCUser,
	initRemoteFiresideRTCUserPrefs,
	setUserHasDesktopAudio,
	setUserHasMicAudio,
	setUserHasVideo,
	setVideoPlayback,
	stopDesktopAudioPlayback,
	stopMicAudioPlayback,
	updateVolumeLevel,
} from './user';

let AgoraRTC: IAgoraRTC | null = null;
const AgoraRTCLoader = importNoSSR(async () => (await import('agora-rtc-sdk-ng')).default).then(
	myAgoraRTC => {
		AgoraRTC = myAgoraRTC;
	}
);

export const FiresideRTCKey = Symbol();

export interface FiresideRTCHost {
	user: UserModel;
	needsPermissionToView: boolean;
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
	// The video token may either be the audience token or the cohost token
	videoToken: string;
	chatChannelName: string;
	// The chat token may either be the audience token or the cohost token
	chatToken: string;
}

type Options = { isPreviewMode?: boolean };

export class FiresideRTC {
	constructor(
		public readonly fireside: FiresideModel,
		public readonly userId: number | null,
		public readonly appId: string,
		public readonly streamingUid: number,
		public readonly videoChannelName: string,
		public videoToken: string,
		public readonly chatChannelName: string,
		public chatToken: string,
		// NOTE: These may be wrapped in Refs if accessing inside the
		// constructor. Check createFiresideRTC for the actual typing before
		// `reactive` unwraps it.
		public readonly hosts: FiresideRTCHost[],
		public readonly listableHostIds: Set<number>,
		public readonly hostBackgrounds: Map<number, BackgroundModel>,
		{ isPreviewMode }: Options
	) {
		this.isPreviewMode = isPreviewMode ?? false;
	}

	readonly isPreviewMode;

	generation = new CancelToken();

	/**
	 *  Safari keeps [AgoraRTC.onAutoplayFailed] looping, so I'm assigning
	 *  to this to ensure we only trigger the failure callback once.
	 */
	_hasAutoplayError = false;
	shouldShowMutedIndicator = false;

	// These channels will get created immediately during _setup.
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
		return this._allStreamingUsers.filter(rtcUser => rtcUser.isListed);
	}

	/**
	 * If the current user is currently streaming in this fireside. This will
	 * only return valid data once everything gets subscribed to.
	 */
	get isPersonallyStreaming() {
		return this.localUser !== null;
	}

	get isFocusingMe() {
		return (
			!!this.focusedUser && !!this.localUser && this.focusedUser.uid === this.localUser.uid
		);
	}

	get isPoorNetworkQuality() {
		return this.videoChannel.isPoorNetworkQuality || this.chatChannel.isPoorNetworkQuality;
	}
}

export function createFiresideRTC(
	fireside: FiresideModel,
	userId: number | null,
	agoraStreamingInfo: AgoraStreamingInfo,
	hosts: Ref<FiresideRTCHost[]>,
	listableHostIds: Ref<Set<number>>,
	hostBackgrounds: Ref<Map<number, BackgroundModel>>,
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
			agoraStreamingInfo.chatChannelName,
			agoraStreamingInfo.chatToken,
			// Stop typescript from complaining about Vue types.
			//
			// `reactive` will unwrap refs, but the type is still technically
			// wrong until the class is constructed and `reactive` can unwrap
			// the fields.
			hosts as unknown as FiresideRTCHost[],
			listableHostIds as unknown as Set<number>,
			hostBackgrounds as unknown as Map<number, BackgroundModel>,
			options
		)
	) as FiresideRTC;

	_setup(rtc);
	return rtc;
}

export async function destroyFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(destroy)');

	// Don't assign a new one so that we stay in a canceled state.
	rtc.generation.cancel();

	const wasStreaming = !!rtc.producer?.isStreaming.value;
	if (rtc.producer) {
		if (wasStreaming) {
			// cleanupFiresideRTCProducer does not call stopStreaming,
			// so some teardown logic needs to be done here.
			// The actual streams are closed and destroyed later in this function.
			updateSetIsStreaming(rtc.producer, { isStreaming: false });
		}

		cleanupFiresideRTCProducer(rtc.producer);
		rtc.producer = null;
	}

	try {
		await Promise.all(
			rtc._allStreamingUsers.map(user =>
				Promise.all([
					setVideoPlayback(user, new FiresideVideoPlayStateStopped()),
					stopDesktopAudioPlayback(user),
					stopMicAudioPlayback(user),
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

async function _recreateFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(recreate)');
	await destroyFiresideRTC(rtc);
	return _setup(rtc);
}

export function setListableHostIds(rtc: FiresideRTC, listableHostIds: Set<number>) {
	rtc.listableHostIds.clear();
	for (const id of listableHostIds) {
		rtc.listableHostIds.add(id);
	}
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
		_recreateFiresideRTC(rtc);
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

	// Wait for Agora to be fully initialized.
	await AgoraRTCLoader;
	gen.assert();

	_createChannels(rtc);

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
		// We dont want side effects from canceled rtc instances.
		if (rtc.generation.isCanceled) {
			return;
		}

		chooseFocusedRTCUser(rtc);

		if (!rtc.setupFinalized) {
			rtc.setupFinalized = true;
			rtc.log(`Setup finalized.`);
		}
	}, 500);

	rtc.log(`Debouncing finalize setup.`);
	rtc.finalizeSetupFn?.();
}

function _createChannels(rtc: FiresideRTC) {
	rtc.log('Trace(createChannels)');

	if (!AgoraRTC) {
		throw new Error('Expected AgoraRTC to be resolved by now');
	}

	(AgoraRTC as any).setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);

	// If we fail to autoplay, pause the stream so we have to interact with the
	// DOM to play it.
	AgoraRTC.onAutoplayFailed = async () => {
		if (rtc._hasAutoplayError) {
			return;
		}
		rtc._hasAutoplayError = true;

		// Pause videos and indicate that the video is currently playing in a
		// muted state.
		const wasPaused = rtc.videoPaused;
		rtc.videoPaused = true;
		rtc.shouldShowMutedIndicator = true;

		// Any document interaction seems sufficient to cause the audio to play
		// once all the stream subscriptions are active.
		window.document.addEventListener(
			'click',
			async () => {
				rtc._hasAutoplayError = false;
				rtc.shouldShowMutedIndicator = false;

				// Wait a moment in case the way they triggered this way by
				// clicking the play button.
				await sleep(0);
				// Set [videoPaused] to its previous state if we're still
				// paused.
				if (rtc.videoPaused) {
					rtc.videoPaused = wasPaused;
				}
			},
			{
				once: true,
				capture: true,
				passive: true,
			}
		);
	};

	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);

	rtc.videoChannel = createFiresideRTCChannel(
		rtc,
		rtc.videoChannelName,
		rtc.videoToken,
		AgoraRTC,
		{
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
		}
	);

	rtc.chatChannel = createFiresideRTCChannel(rtc, rtc.chatChannelName, rtc.chatToken, AgoraRTC, {
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
		// TODO(big-pp-event) check that this works.
		if (!rtc.focusedUser.isListed) {
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
		// Need to do this after we add the user to our list, otherwise we won't
		// be able to find a User during this call and nothing will happen.
		initRemoteFiresideRTCUserPrefs(user);
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

	cleanupFiresideRTCUser(user);

	arrayRemove(rtc._remoteStreamingUsers, i => {
		// NOTE: Always compare something like [uid] or wrap objects in [toRaw]
		// when checking equality. If we don't we may end up comparing a proxy
		// of the object to the raw object, failing the quality check.
		return i.uid === user.uid;
	});

	if (rtc.focusedUser?.uid === user.uid) {
		rtc.focusedUser = null;
		chooseFocusedRTCUser(rtc);
	}
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	/**
	 * Checking against {@link rtc._allStreamingUsers} which includes the local
	 * user. Change to {@link rtc._remoteStreamingUsers} if we want to disable
	 * host thumb indicators for self.
	 */
	for (const user of rtc._allStreamingUsers) {
		updateVolumeLevel(user);
	}
}
