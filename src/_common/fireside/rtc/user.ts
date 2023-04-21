import { OvenPlayer } from 'ovenplayer';
import { WatchStopHandle, reactive, toRaw, watch } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';
import { FiresideRTC, chooseFocusedRTCUser } from './rtc';

export type FiresideVideoQuality = 'low' | 'high';
export type FiresideVideoFit = 'cover' | 'contain' | 'fill' | undefined;

export class FiresideVideoLock {
	released = false;

	constructor(
		public readonly target: HTMLElement,
		public readonly quality: FiresideVideoQuality
	) {}
}

/**
 * This is a user in the FiresideRTC. It can be the local user or a remote user.
 */
export class FiresideRTCUser {
	constructor(
		public readonly rtc: FiresideRTC,
		public readonly userId: number,
		public readonly isLocal: boolean
	) {
		this.micAudioPlayState = rtc.isMuted;
	}

	/**
	 * **Only assigned for remote users.** Holds the OvenPlayer instance for the
	 * video channel.
	 */
	_videoPlayer: OvenPlayer | null = null;

	/**
	 * **Only assigned for remote users.** Holds the OvenPlayer instance for the
	 * chat channel.
	 */
	_chatPlayer: OvenPlayer | null = null;

	/**
	 * **Only assigned for local users.** Holds the MediaStream for the video
	 * channel.
	 */
	_videoMediaStream: MediaStream | null = null;

	/**
	 * **Only assigned for local users.** Holds the MediaStream for the chat
	 * channel.
	 */
	_chatMediaStream: MediaStream | null = null;

	/**
	 * A stack of locations aiming to display the video, such as thumbnails, the
	 * focused player, etc. Each location attempts to secure a lock for the
	 * video, with the most recently acquired lock being the active one. When a
	 * lock is released, the subsequent lock in line will start playing the
	 * video.
	 */
	readonly videoLocks: FiresideVideoLock[] = [];

	// TODO(oven)
	hasMicAudio = true;
	hasVideo = true;
	hasDesktopAudio = true;

	// TODO(oven): eh?
	videoAspectRatio = 16 / 9;

	videoPlayState = false;
	micAudioPlayState = false;
	desktopAudioPlayState = false;

	/**
	 * Scaled from 0 to 1, this is the mic volume level data that we're
	 * receiving from the user.
	 *
	 * Used so we can display a ring around the user avatar while they're
	 * speaking.
	 */
	volumeLevel = 0;

	/**
	 * Scaled from 0 to 1, this is the volume we want their mic audio to be when
	 * played on their device.
	 */
	micPlaybackVolumeLevel = 1;

	/**
	 * Scaled from 0 to 1, this is the volume we want their desktop audio to be
	 * when played on their device.
	 */
	desktopPlaybackVolumeLevel = 0.75;

	_unwatchIsListed: WatchStopHandle | null = null;
	_unwatchPrefableFields: WatchStopHandle | null = null;

	get isRemote() {
		return !this.isLocal;
	}

	get _rtcHost() {
		return this.rtc.hosts.find(host => host.uids.includes(this.userId));
	}

	get userModel() {
		return this._rtcHost?.user ?? null;
	}

	get showMicMuted() {
		return this.micAudioPlayState || !this.micPlaybackVolumeLevel;
	}

	get showDesktopAudioMuted() {
		if (!this.hasDesktopAudio) {
			return false;
		}
		return this.desktopAudioPlayState || !this.desktopPlaybackVolumeLevel;
	}

	/**
	 * The current video lock tells us where to render their video, and how.
	 */
	get currentVideoLock() {
		return this.videoLocks.length > 0 ? this.videoLocks[this.videoLocks.length - 1] : null;
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

export function createRemoteFiresideRTCUser(rtc: FiresideRTC, userId: number) {
	const user = reactive(new FiresideRTCUser(rtc, userId, false)) as FiresideRTCUser;

	user._unwatchIsListed = watch(
		() => user.isListed,
		(isListed, wasListed) => {
			rtc.log(
				`${_userIdForLog(user)} -> isListed transitioned from ${
					wasListed ? 'true' : 'false'
				} to ${isListed ? 'true' : 'false'}`
			);

			// TODO(oven): question I have, does initializing the user with the
			// saved prefs do similar things to the below code?

			// if (!isListed) {
			// 	_stopMicAudioPlayback(user);
			// 	return;
			// }

			// // Find all other remote users.
			// const otherUsers = rtc.listableStreamingUsers.filter(
			// 	i => !i.isLocal && i.userId !== userId
			// );
			// const isOnlyUser = otherUsers.length === 0;

			// if (isOnlyUser) {
			// 	// If this is the only user, we can safely start our playback.
			// 	_startMicAudioPlayback(user);
			// } else if (otherUsers.every(i => i.remoteMicAudioMuted)) {
			// 	// Mute this user if all other listed users are muted.
			// 	_stopMicAudioPlayback(user);
			// } else {
			// 	// If any listed users are unmuted, unmute ourselves when
			// 	// becoming listed.
			// 	_startMicAudioPlayback(user);
			// }
		}
	);

	user._unwatchPrefableFields = watch(
		() => [
			user.micAudioPlayState,
			user.desktopAudioPlayState,
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

export function createLocalFiresideRTCUser(rtc: FiresideRTC, userId: number) {
	return reactive(new FiresideRTCUser(rtc, userId, true)) as FiresideRTCUser;
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
		setMicAudioPlayState(user, !remoteMicAudioMuted);
	}
	if (remoteDesktopAudioMuted !== undefined) {
		setDesktopAudioPlayState(user, !remoteDesktopAudioMuted);
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
		remoteMicAudioMuted: !user.micAudioPlayState,
		remoteDesktopAudioMuted: !user.desktopAudioPlayState,
		micPlaybackVolumeLevel: user.micPlaybackVolumeLevel,
		desktopPlaybackVolumeLevel: user.desktopPlaybackVolumeLevel,
	};

	sessionStorage.setItem(
		_getFiresideRTCUserPrefKey(fireside, userModel),
		JSON.stringify(options)
	);
}

export function cleanupFiresideRTCUser(user: FiresideRTCUser) {
	// user.remoteVideoUser = null;
	// user.remoteChatUser = null;

	user._unwatchIsListed?.();
	user._unwatchIsListed = null;

	user._unwatchPrefableFields?.();
	user._unwatchPrefableFields = null;
}

function _userIdForLog(user: FiresideRTCUser) {
	return `(user: ${user.userModel?.id ?? 'n/a'}, uid: ${user.userId})`;
}

export function setUserHasVideo(user: FiresideRTCUser, hasVideo: boolean) {
	user.hasVideo = hasVideo;

	if (!hasVideo) {
		chooseFocusedRTCUser(user.rtc);
	}
}

export function setUserHasDesktopAudio(user: FiresideRTCUser, hasDesktopAudio: boolean) {
	user.hasDesktopAudio = hasDesktopAudio;

	if (!hasDesktopAudio) {
		chooseFocusedRTCUser(user.rtc);
	}
}

export function setUserHasMicAudio(user: FiresideRTCUser, hasMicAudio: boolean) {
	user.hasMicAudio = hasMicAudio;

	if (!hasMicAudio) {
		chooseFocusedRTCUser(user.rtc);
	}
}

/**
 * This should be called before playing a video. [releaseVideoLock] must be
 * called when you no longer need to be playing the video.
 */
export function getVideoLock(
	user: FiresideRTCUser,
	target: HTMLElement,
	quality: FiresideVideoQuality
) {
	const lock = new FiresideVideoLock(target, quality);
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
}

/**
 * Used to set the playback state of the video stream for this user. This will
 * only set the state. It's up to the components to react to this state.
 */
export async function setVideoPlayState(user: FiresideRTCUser, isPlaying: boolean) {
	const { rtc } = user;

	if (user.videoPlayState === isPlaying) {
		return;
	}

	rtc.log('Setting new playback state.', { isPlaying });
	user.videoPlayState = isPlaying;
}

export function setDesktopAudioPlayState(user: FiresideRTCUser, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.desktopAudioPlayState === !isPlaying) {
		return;
	}

	user.desktopAudioPlayState = !isPlaying;
}

export function setMicAudioPlayState(user: FiresideRTCUser, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.micAudioPlayState === isPlaying) {
		return;
	}

	user.micAudioPlayState = isPlaying;
}

export function updateVolumeLevel(user: FiresideRTCUser) {
	// TODO(oven)
	// // Ignore remote users that have no active track.
	// if (
	// 	(user._micAudioTrack?.isPlaying !== true && !user.isLocal) ||
	// 	(user.isLocal && user.rtc.producer?.micMuted.value === true)
	// ) {
	// 	user.volumeLevel = 0;
	// 	return;
	// }
	// const level = user._micAudioTrack?.getVolumeLevel() || 0;
	// // Treat the user as speaking when their volume level is above a certain
	// // threshold.
	// if (level > 0.6) {
	// 	user.volumeLevel = 1;
	// } else {
	// 	user.volumeLevel = 0;
	// }
}

/** Expects a value from 0 to 1 */
export function setUserMicrophoneAudioVolume(user: FiresideRTCUser, percent: number) {
	user.micPlaybackVolumeLevel = percent;
}

/** Expects a value from 0 to 1 */
export function setUserDesktopAudioVolume(user: FiresideRTCUser, percent: number) {
	user.desktopPlaybackVolumeLevel = percent;
}
