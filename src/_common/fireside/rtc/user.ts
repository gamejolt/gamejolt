import {
	IAgoraRTCRemoteUser,
	ILocalAudioTrack,
	ILocalVideoTrack,
	IRemoteAudioTrack,
	IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { markRaw, reactive, toRaw, watch, WatchStopHandle } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';
import { updateTrackPlaybackDevice } from './producer';
import { chooseFocusedRTCUser, FiresideRTC } from './rtc';

export type FiresideVideoFit = 'cover' | 'contain' | 'fill' | undefined;
export class FiresideVideoPlayStatePlaying {
	isPlaying = true;
	constructor(
		public readonly element: HTMLDivElement,
		public readonly isLowBitrate: boolean,
		public readonly videoFit: FiresideVideoFit
	) {}
}

export class FiresideVideoPlayStateStopped {
	isPlaying = false;
}

export type FiresideVideoPlayState = FiresideVideoPlayStatePlaying | FiresideVideoPlayStateStopped;

function _comparePlayState(a_: FiresideVideoPlayState, b_: FiresideVideoPlayState) {
	const a = toRaw(a_);
	const b = toRaw(b_);

	if (a === b) {
		return true;
	}

	if (a instanceof FiresideVideoPlayStatePlaying && b instanceof FiresideVideoPlayStatePlaying) {
		return (
			a.element === b.element &&
			a.isLowBitrate === b.isLowBitrate &&
			a.videoFit === b.videoFit
		);
	}

	return a.isPlaying === b.isPlaying;
}

export class FiresideVideoLock {
	released = false;
}

export class FiresideRTCUser {
	constructor(
		public readonly rtc: FiresideRTC,
		public readonly uid: number,
		public readonly isLocal: boolean
	) {
		this.remoteMicAudioMuted = rtc.isMuted;
	}

	// These won't be assigned if this is the local user.
	remoteVideoUser: IAgoraRTCRemoteUser | null = null;
	remoteChatUser: IAgoraRTCRemoteUser | null = null;

	_videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null = null;
	_desktopAudioTrack: ILocalAudioTrack | IRemoteAudioTrack | null = null;
	_micAudioTrack: ILocalAudioTrack | IRemoteAudioTrack | null = null;

	videoPlayState: FiresideVideoPlayState = new FiresideVideoPlayStateStopped();
	queuedVideoPlayState: FiresideVideoPlayState | null = null;
	readonly videoLocks: FiresideVideoLock[] = [];

	hasMicAudio = false;
	hasVideo = false;
	hasDesktopAudio = false;

	pausedFrameData: ImageData | null = null;
	videoAspectRatio = 16 / 9;

	remoteMicAudioMuted = false;
	remoteDesktopAudioMuted = false;

	/**
	 * Scaled from 0 to 1, this is the mic volume level data that we're
	 * receiving from the user.
	 *
	 * Used so we can display a ring around the user avatar while they're
	 * speaking.
	 */
	volumeLevel = 0;

	/**
	 * Scaled from 0 to 1, this is the mic volume percent we want to receive
	 * from the user.
	 */
	micPlaybackVolumeLevel = 1;

	/**
	 * Scaled from 0 to 1, this is the desktop volume percent we want to receive
	 * from the user.
	 */
	desktopPlaybackVolumeLevel = 0.75;

	_unwatchIsListed: WatchStopHandle | null = null;
	_unwatchPrefableFields: WatchStopHandle | null = null;

	get _rtcHost() {
		return this.rtc.hosts.find(host => host.uids.includes(this.uid));
	}

	get userModel() {
		return this._rtcHost?.user ?? null;
	}

	get showMicMuted() {
		return this.remoteMicAudioMuted || !this.micPlaybackVolumeLevel;
	}

	get showDesktopAudioMuted() {
		if (!this.hasDesktopAudio) {
			return false;
		}
		return this.remoteDesktopAudioMuted || !this.desktopPlaybackVolumeLevel;
	}

	get isListed() {
		// Local user is always listable.
		if (this.isLocal) {
			return true;
		}

		// If you're able to stream you should be able to see the other
		// streamers always.
		//
		// TODO(unlisted-fireside-hosts) its better to solve this in backend by
		// syncing listable host ids.
		if (this.rtc.fireside.role?.canStream) {
			return true;
		}

		// Treat unknown hosts as unlistable.
		const host = this._rtcHost;
		if (!host) {
			return false;
		}

		// If the host is not unlisted at all we can early out.
		if (!host.needsPermissionToView) {
			return true;
		}

		// Our own user is never unlisted.
		if (host.user.id === this.rtc.userId) {
			return true;
		}

		// If the host isn't explicitly listable, we want to treat it as if they
		// were unlistable to avoid showing a stream for a host we simply did
		// not receive the listable hosts for in time.
		return this.rtc.listableHostIds.has(host.user.id);
	}

	get background() {
		const userId = this.userModel?.id;
		if (!userId) {
			return undefined;
		}
		return this.rtc.hostBackgrounds.get(userId);
	}
}

export function createRemoteFiresideRTCUser(rtc: FiresideRTC, uid: number) {
	const user = reactive(new FiresideRTCUser(rtc, uid, false)) as FiresideRTCUser;

	user._unwatchIsListed = watch(
		() => user.isListed,
		(isListed, wasListed) => {
			rtc.log(
				`${_userIdForLog(user)} -> isListed transitioned from ${
					wasListed ? 'true' : 'false'
				} to ${isListed ? 'true' : 'false'}`
			);

			if (!isListed) {
				stopMicAudioPlayback(user);
				return;
			}

			// Find all other remote users.
			const otherUsers = rtc.listableStreamingUsers.filter(i => !i.isLocal && i.uid !== uid);
			const isOnlyUser = otherUsers.length === 0;

			if (isOnlyUser) {
				// If this is the only user, we can safely start our playback.
				startMicAudioPlayback(user);
			} else if (otherUsers.every(i => i.remoteMicAudioMuted)) {
				// Mute this user if all other listed users are muted.
				stopMicAudioPlayback(user);
			} else {
				// If any listed users are unmuted, unmute ourselves when
				// becoming listed.
				startMicAudioPlayback(user);
			}
		}
	);

	user._unwatchPrefableFields = watch(
		() => [
			user.remoteMicAudioMuted,
			user.remoteDesktopAudioMuted,
			// These should be done in their respective scrubbers so we don't
			// trigger events crazy often.
			//
			// user.micPlaybackVolumeLevel,
			// user.desktopPlaybackVolumeLevel,
		],
		() => {
			saveFiresideRTCUserPrefs(user);
		}
	);

	return user;
}

export function createLocalFiresideRTCUser(rtc: FiresideRTC, uid: number) {
	return reactive(new FiresideRTCUser(rtc, uid, true)) as FiresideRTCUser;
}

export function initRemoteFiresideRTCUserPrefs(user: FiresideRTCUser) {
	// Ignore local user and RTC controllers that disable audio.
	if (user.isLocal || user.rtc.isMuted) {
		return;
	}

	const {
		userModel,
		rtc,
		rtc: { fireside },
	} = user;

	if (!userModel) {
		rtc.log(`Tried initializing RTC user options without a user model - ignoring.`);
		return;
	}

	const existingOptions = sessionStorage.getItem(_getFiresideRTCUserPrefKey(fireside, userModel));
	if (!existingOptions) {
		return;
	}

	const options: FiresideRTCUserPrefs = JSON.parse(existingOptions);
	const {
		desktopPlaybackVolumeLevel,
		micPlaybackVolumeLevel,
		remoteDesktopAudioMuted,
		remoteMicAudioMuted,
	} = options;

	if (remoteMicAudioMuted !== undefined) {
		setMicAudioPlayback(user, !remoteMicAudioMuted);
	}
	if (remoteDesktopAudioMuted !== undefined) {
		setDesktopAudioPlayback(user, !remoteDesktopAudioMuted);
	}
	if (micPlaybackVolumeLevel !== undefined) {
		setUserMicrophoneAudioVolume(user, micPlaybackVolumeLevel);
	}
	if (desktopPlaybackVolumeLevel !== undefined) {
		setUserDesktopAudioVolume(user, desktopPlaybackVolumeLevel);
	}
}

function _getFiresideRTCUserPrefKey(fireside: Fireside, userModel: User) {
	return `${fireside.id}-${userModel.id}`;
}

interface FiresideRTCUserPrefs {
	remoteMicAudioMuted: boolean | undefined;
	remoteDesktopAudioMuted: boolean | undefined;
	micPlaybackVolumeLevel: number | undefined;
	desktopPlaybackVolumeLevel: number | undefined;
}

export function saveFiresideRTCUserPrefs(user: FiresideRTCUser) {
	const {
		userModel,
		rtc: { fireside },
	} = user;

	if (!userModel) {
		return;
	}

	const options: FiresideRTCUserPrefs = {
		remoteMicAudioMuted: user.remoteMicAudioMuted,
		remoteDesktopAudioMuted: user.remoteDesktopAudioMuted,
		micPlaybackVolumeLevel: user.micPlaybackVolumeLevel,
		desktopPlaybackVolumeLevel: user.desktopPlaybackVolumeLevel,
	};

	sessionStorage.setItem(
		_getFiresideRTCUserPrefKey(fireside, userModel),
		JSON.stringify(options)
	);
}

export function cleanupFiresideRTCUser(user: FiresideRTCUser) {
	user.remoteVideoUser = null;
	user.remoteChatUser = null;

	user._unwatchIsListed?.();
	user._unwatchIsListed = null;

	user._unwatchPrefableFields?.();
	user._unwatchPrefableFields = null;
}

function _userIdForLog(user: FiresideRTCUser) {
	return `(user: ${user.userModel?.id ?? 'n/a'}, uid: ${user.uid})`;
}

export function setUserHasVideo(user: FiresideRTCUser, hasVideo: boolean) {
	if (hasVideo) {
		user.hasVideo = true;
	} else {
		setVideoPlayback(user, new FiresideVideoPlayStateStopped());
		user.hasVideo = false;
		chooseFocusedRTCUser(user.rtc);
	}
}

export function setUserHasDesktopAudio(user: FiresideRTCUser, hasDesktopAudio: boolean) {
	if (hasDesktopAudio) {
		user.hasDesktopAudio = true;
	} else {
		user.hasDesktopAudio = false;
		chooseFocusedRTCUser(user.rtc);
	}
}

export function setUserHasMicAudio(user: FiresideRTCUser, hasMicAudio: boolean) {
	if (hasMicAudio) {
		user.hasMicAudio = true;

		if (!user.remoteMicAudioMuted) {
			startMicAudioPlayback(user);
		}
	} else {
		stopMicAudioPlayback(user);
		user.hasMicAudio = false;
		chooseFocusedRTCUser(user.rtc);
	}
}

/**
 * This should be called before playing a video. [releaseVideoLock] must be
 * called when you no longer need to be playing the video.
 */
export function getVideoLock(user: FiresideRTCUser) {
	const lock = new FiresideVideoLock();
	user.videoLocks.push(lock);
	return lock;
}

/**
 * Should be called to release the video lock back to the system. If this was
 * the last lock, the video will be unsubscribed from.
 */
export function releaseVideoLock(user: FiresideRTCUser, lock: FiresideVideoLock) {
	if (lock.released) {
		return;
	}

	lock.released = true;
	arrayRemove(user.videoLocks, i => {
		// [FiresideRTCUser] instances may be wrapped in a [reactive] or [ref],
		// which would cause triple-equals to fail (equality on the proxy vs.
		// the raw value).
		//
		// Make sure we call [toRaw] on these so that we always compare the
		// actual raw class value for equality.
		return toRaw(i) === toRaw(lock);
	});

	// When there's no more locks, stop the video.
	if (!user.videoLocks.length) {
		setVideoPlayback(user, new FiresideVideoPlayStateStopped());
	}
}

export function setupFiresideVideoElementListeners(element: HTMLElement, user: FiresideRTCUser) {
	const video = element.querySelector('video');

	if (!import.meta.env.SSR && video instanceof HTMLVideoElement) {
		video.addEventListener(
			'resize',
			() => (user.videoAspectRatio = video.videoWidth / video.videoHeight),
			{
				passive: true,
			}
		);
	}
}

/**
 * Used to set the new state for video playback for a [FiresideRTCUser]. Make
 * sure to acquire/release the appropriate locks, or things may get out of sync.
 */
export async function setVideoPlayback(user: FiresideRTCUser, newState: FiresideVideoPlayState) {
	const { rtc } = user;

	// If user doesn't have a video stream to subscribe/unsubscribe to, nothing to do.
	if (!user.hasVideo) {
		rtc.log('No video or no video client');
		return;
	}

	const isBusy = user.queuedVideoPlayState !== null;
	if (isBusy) {
		rtc.log('Queue up new video play state change, we are already busy.', { ...newState });
		return;
	}

	// If the user isn't listed and we're not trying to stop the video, stop the
	// operation and attempt to stop playback.
	if (!user.isListed && !_comparePlayState(newState, new FiresideVideoPlayStateStopped())) {
		const err = new Error('Attempted to start video playback for unlisted user');
		rtc.logError(err.message);
		console.error(err);

		setVideoPlayback(user, new FiresideVideoPlayStateStopped());
		return;
	}

	// If user is already in the desired state for video subscriptions, noop.
	if (_comparePlayState(user.videoPlayState, newState)) {
		rtc.log('Already in desired state.', {
			newState: { ...newState },
			existingState: { ...user.videoPlayState },
		});
		return;
	}

	user.queuedVideoPlayState = newState;
	rtc.log('Setting new play state.', { ...newState });

	if (newState instanceof FiresideVideoPlayStatePlaying) {
		try {
			// If they're a remote user, we need to subscribe to their video first.
			if (user.remoteVideoUser) {
				user._videoTrack = markRaw(
					await rtc.videoChannel.agoraClient.subscribe(user.remoteVideoUser, 'video')
				);
			}

			// Wait for next tick before playing so that any video playback elements
			// are first deregistered.
			await sleep(0);

			user._videoTrack?.play(newState.element, {
				// Don't mirror any tracks - local or remote.
				mirror: false,
				fit: newState.videoFit,
			});

			setupFiresideVideoElementListeners(newState.element, user);

			// TODO: Test to make sure this doesn't fail if we're trying to set against a local user.
			rtc.videoChannel.agoraClient.setRemoteVideoStreamType(
				user.uid,
				newState.isLowBitrate ? 1 : 0
			);
		} catch (e) {
			rtc.logError(`Failed to subscribe to video for user ${_userIdForLog(user)}`, e);
		}
	} else if (newState instanceof FiresideVideoPlayStateStopped) {
		try {
			if (user._videoTrack?.isPlaying) {
				try {
					user.pausedFrameData = user._videoTrack.getCurrentFrameData();
					user._videoTrack.stop();
				} catch (e) {
					rtc.logWarning(
						`Got an error while stopping a video track for user ${_userIdForLog(
							user
						)}. Tolerating.`,
						e
					);
				}
			}

			// Only unsubscribe for remote users.
			if (user.remoteVideoUser) {
				await rtc.videoChannel.agoraClient.unsubscribe(user.remoteVideoUser, 'video');

				// TODO: we might want to set the video track to null even
				// before unsubscribing. this is because unsubscribe may fail if
				// we already left the channel or it got disconnected for some
				// reason. in these cases the video track should still get
				// unset, however I don't know what happens if the error is
				// literally with unsubscribing, and the video track remains
				// intact.
				user._videoTrack = null;
			}

			// Make sure all the locks are released (just in case).
			for (const lock of user.videoLocks) {
				lock.released = true;
			}
			user.videoLocks.splice(0);
		} catch (e) {
			rtc.logError(
				`Failed to subscribe to video thumbnails for user ${_userIdForLog(user)}`,
				e
			);
		}
	}

	// Apply the new video play state finally.
	user.videoPlayState = newState;

	// While we were performing this operation, a new play state may have been
	// queued.
	const queuedState = user.queuedVideoPlayState;
	user.queuedVideoPlayState = null;

	// If the operation's state doesn't match up with our desired state, run
	// through this whole process again with the queued play state.
	if (!_comparePlayState(queuedState, user.videoPlayState)) {
		setVideoPlayback(user, queuedState);
	}
}

export async function startDesktopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${_userIdForLog(user)} -> startDesktopAudioPlayback`);

	if (!user.isListed) {
		const err = new Error('Attempted to start desktop audio playback for unlisted user');
		rtc.logError(err.message);
		console.error(err);
		return;
	}

	try {
		// Only subscribe for remote users.
		if (user.remoteVideoUser) {
			user._desktopAudioTrack = markRaw(
				await rtc.videoChannel.agoraClient.subscribe(user.remoteVideoUser, 'audio')
			);

			// Make sure the track is using their playback device if they have
			// chosen one in the producer.
			if (rtc.producer) {
				updateTrackPlaybackDevice(rtc.producer, user._desktopAudioTrack);
			}

			user._desktopAudioTrack.play();
		}

		setUserDesktopAudioVolume(user, user.desktopPlaybackVolumeLevel);
	} catch (e) {
		rtc.logError('Failed to start desktop audio playback, attempting to gracefully stop.', e);

		stopDesktopAudioPlayback(user);
		throw e;
	}
}

export async function stopDesktopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${_userIdForLog(user)} -> stopDesktopAudioPlayback`);

	if (user._desktopAudioTrack?.isPlaying === true) {
		rtc.log('Stopping existing desktop audio track');
		try {
			user._desktopAudioTrack.stop();
		} catch (e) {
			rtc.logWarning('Failed to stop desktop audio track playback', e);
		}
	}

	// Only unsubscribe for remote users.
	if (user.remoteVideoUser) {
		try {
			user._desktopAudioTrack = null;
			await rtc.videoChannel.agoraClient.unsubscribe(user.remoteVideoUser, 'audio');
		} catch (e) {
			rtc.logWarning(
				`Failed to unsubscribe to desktop audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.`
			);
		}
	}
}

export function setMicAudioPlayback(user: FiresideRTCUser, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.remoteMicAudioMuted === !isPlaying) {
		return;
	}

	user.remoteMicAudioMuted = !isPlaying;

	if (user.remoteMicAudioMuted) {
		stopMicAudioPlayback(user);
	} else {
		startMicAudioPlayback(user);
	}
}

export function setDesktopAudioPlayback(user: FiresideRTCUser, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.remoteDesktopAudioMuted === !isPlaying) {
		return;
	}

	user.remoteDesktopAudioMuted = !isPlaying;

	if (user.remoteDesktopAudioMuted) {
		stopDesktopAudioPlayback(user);
	} else {
		startDesktopAudioPlayback(user);
	}
}

export async function startMicAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${_userIdForLog(user)} -> startAudioPlayback`);

	if (!user.remoteChatUser) {
		return;
	}

	if (!user.isListed) {
		const err = new Error('Attempted to start mic audio playback for unlisted user');
		rtc.logWarning(err.message);
		console.warn(err);
		return;
	}

	try {
		user._micAudioTrack = markRaw(
			await rtc.chatChannel.agoraClient.subscribe(user.remoteChatUser, 'audio')
		);

		// Make sure the track is using their playback device if they have
		// chosen one in the producer.
		if (rtc.producer) {
			updateTrackPlaybackDevice(rtc.producer, user._micAudioTrack);
		}

		// Set their mic volume to our preference before playing.
		setUserMicrophoneAudioVolume(user, user.micPlaybackVolumeLevel);

		user._micAudioTrack.play();
	} catch (e) {
		rtc.logError('Failed to start video playback, attempting to gracefully stop.', e);

		stopMicAudioPlayback(user);
		throw e;
	}
}

export async function stopMicAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${_userIdForLog(user)} -> stopAudioPlayback`);

	if (!user.remoteChatUser) {
		return;
	}

	if (user._micAudioTrack?.isPlaying) {
		rtc.log('Stopping existing audio track');
		try {
			user._micAudioTrack.stop();
		} catch (e) {
			rtc.logWarning('Failed to stop mic audio track playback', e);
		}
	}

	try {
		user._micAudioTrack = null;
		await rtc.chatChannel.agoraClient.unsubscribe(user.remoteChatUser, 'audio');
	} catch (e) {
		rtc.logWarning(
			`Failed to unsubscribe to mic audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.`
		);
	}
}

export function updateVolumeLevel(user: FiresideRTCUser) {
	// Ignore remote users that have no active track.
	if (
		(user._micAudioTrack?.isPlaying !== true && !user.isLocal) ||
		(user.isLocal && user.rtc.producer?.micMuted.value === true)
	) {
		user.volumeLevel = 0;
		return;
	}

	const level = user._micAudioTrack?.getVolumeLevel() || 0;

	// Treat the user as speaking when their volume level is above a certain
	// threshold.
	if (level > 0.6) {
		user.volumeLevel = 1;
	} else {
		user.volumeLevel = 0;
	}
}

/** Expects a value from 0 to 1 */
export function setUserMicrophoneAudioVolume(user: FiresideRTCUser, percent: number) {
	user._micAudioTrack?.setVolume(Math.round(percent * 100));
	user.micPlaybackVolumeLevel = percent;
}

/** Expects a value from 0 to 1 */
export function setUserDesktopAudioVolume(user: FiresideRTCUser, percent: number) {
	user._desktopAudioTrack?.setVolume(Math.round(percent * 100));
	user.desktopPlaybackVolumeLevel = percent;
}
