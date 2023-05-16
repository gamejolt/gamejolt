import { OvenPlayer } from 'ovenplayer';
import { WatchStopHandle, reactive, toRaw, watch } from 'vue';
import type { FiresideController } from '../../../app/components/fireside/controller/controller';
import { chooseFocusedHost } from '../../../app/components/fireside/controller/controller';
import { arrayRemove } from '../../../utils/array';
import { Background } from '../../background/background.model';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';

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
 * This is a host in the fireside. They can be streaming or not. It's basically
 * anyone with permissions.
 */
export class FiresideHost {
	constructor(options: { userId: number; isMe: boolean; isMuted: boolean }) {
		this.userId = options.userId;
		this.isMe = options.isMe;
		this.micAudioPlayState = options.isMuted;
	}

	public readonly userId: number;
	public readonly isMe: boolean;

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
	userModel!: User;
	background?: Background;
	hasMicAudio = true;
	hasVideo = true;
	hasDesktopAudio = true;
	needsPermissionToView = false;

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

	_unwatchPrefableFields: WatchStopHandle | null = null;

	get isLive() {
		return this.hasDesktopAudio || this.hasMicAudio || this.hasVideo;
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
}

export function syncFiresideHost(controller: FiresideController, userId: number, data: any) {
	const { logger, hosts } = controller;
	logger.info('Syncing fireside host', userId, data);

	let host = hosts.value.find(i => i.userId === userId);

	let wasNew = false;
	if (!host) {
		host = _createFiresideHost(controller, data);
		wasNew = true;
	}

	const wasLive = host.isLive;

	// TODO(oven): this is actually a chat user model coming in
	host.userModel = new User(data.user);
	host.background = data.background ? new Background(data.background) : undefined;
	host.hasMicAudio = data.is_streaming_audio_mic;
	host.hasDesktopAudio = data.is_streaming_audio_desktop;
	host.hasVideo = data.is_streaming_video;

	if (wasNew) {
		hosts.value.push(host);
		_initRemoteHostPrefs(controller, host);
	}

	// TODO(oven): when they stop streaming, we may want to consider them
	// offline so that prefable watchers get destroyed.

	// If the host went live or offline, we need to re-choose the focused host.
	if (wasLive !== host.isLive) {
		chooseFocusedHost(controller);
	}
}

function _createFiresideHost(controller: FiresideController, data: any) {
	const { isMuted, user } = controller;

	const isMe = Boolean(user.value && user.value.id === data.user_id);

	const host = reactive(
		new FiresideHost({
			userId: data.user_id,
			isMe,
			isMuted: isMuted.value,
		})
	) as FiresideHost;

	host._unwatchPrefableFields = watch(
		() => [
			host.micAudioPlayState,
			host.desktopAudioPlayState,
			// These should be done in their respective scrubbers so we don't
			// trigger events crazy often.
			//
			// user.micPlaybackVolumeLevel,
			// user.desktopPlaybackVolumeLevel,
		],
		() => {
			saveFiresideHostPrefs(controller, host);
		}
	);

	return host;
}

// TODO(oven): this isn't being called since we don't have this implemented in grid just yet
export function removeFiresideHost(controller: FiresideController, userId: number) {
	const { logger, hosts, focusedHost } = controller;

	logger.info('Fireside host left', userId);

	// Ideally we'd like to check _remoteStreamingUsers but I don't trust Agora
	// to actually emit these events only for remote users.
	// If it gets emitted for a local user we'll throw.
	const user = hosts.value.find(i => i.userId === userId);
	if (!user) {
		logger.warn(`Couldn't find remote host locally`, userId);
		return;
	}

	user._unwatchPrefableFields?.();
	user._unwatchPrefableFields = null;

	arrayRemove(controller.hosts.value, i => i.userId === user.userId);

	if (focusedHost.value?.userId === user.userId) {
		focusedHost.value = null;
		chooseFocusedHost(controller);
	}
}

function _initRemoteHostPrefs({ fireside, isMuted }: FiresideController, host: FiresideHost) {
	// Ignore controllers that disable audio.
	if (isMuted.value) {
		return;
	}

	const { userModel } = host;

	const existingOptions = sessionStorage.getItem(_getHostPrefKey(fireside, userModel));
	if (!existingOptions) {
		return;
	}

	const options: FiresideHostPrefs = JSON.parse(existingOptions);
	const {
		desktopPlaybackVolumeLevel,
		micPlaybackVolumeLevel,
		remoteDesktopAudioMuted,
		remoteMicAudioMuted,
	} = options;

	if (remoteMicAudioMuted !== undefined) {
		setMicAudioPlayState(host, !remoteMicAudioMuted);
	}
	if (remoteDesktopAudioMuted !== undefined) {
		setDesktopAudioPlayState(host, !remoteDesktopAudioMuted);
	}
	if (micPlaybackVolumeLevel !== undefined) {
		setUserMicrophoneAudioVolume(host, micPlaybackVolumeLevel);
	}
	if (desktopPlaybackVolumeLevel !== undefined) {
		setUserDesktopAudioVolume(host, desktopPlaybackVolumeLevel);
	}
}

function _getHostPrefKey(fireside: Fireside, userModel: User) {
	return `${fireside.id}-${userModel.id}`;
}

interface FiresideHostPrefs {
	remoteMicAudioMuted: boolean | undefined;
	remoteDesktopAudioMuted: boolean | undefined;
	micPlaybackVolumeLevel: number | undefined;
	desktopPlaybackVolumeLevel: number | undefined;
}

export function saveFiresideHostPrefs({ fireside }: FiresideController, host: FiresideHost) {
	const { userModel } = host;

	const options: FiresideHostPrefs = {
		remoteMicAudioMuted: !host.micAudioPlayState,
		remoteDesktopAudioMuted: !host.desktopAudioPlayState,
		micPlaybackVolumeLevel: host.micPlaybackVolumeLevel,
		desktopPlaybackVolumeLevel: host.desktopPlaybackVolumeLevel,
	};

	sessionStorage.setItem(_getHostPrefKey(fireside, userModel), JSON.stringify(options));
}

/**
 * This should be called before playing a video. [releaseVideoLock] must be
 * called when you no longer need to be playing the video.
 */
export function getVideoLock(
	user: FiresideHost,
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
export function releaseVideoLock(user: FiresideHost, lock: FiresideVideoLock) {
	if (lock.released) {
		return;
	}

	lock.released = true;
	arrayRemove(user.videoLocks, i => {
		// [FiresideRTCHost] instances may be wrapped in a [reactive] or [ref],
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
export async function setVideoPlayState(user: FiresideHost, isPlaying: boolean) {
	if (user.videoPlayState === isPlaying) {
		return;
	}

	user.videoPlayState = isPlaying;
}

export function setDesktopAudioPlayState(user: FiresideHost, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.desktopAudioPlayState === !isPlaying) {
		return;
	}

	user.desktopAudioPlayState = !isPlaying;
}

export function setMicAudioPlayState(user: FiresideHost, isPlaying: boolean) {
	// This can get called multiple times if we're adjusting with an audio
	// slider. If there's no change, do nothing.
	if (user.micAudioPlayState === isPlaying) {
		return;
	}

	user.micAudioPlayState = isPlaying;
}

export function updateVolumeLevel(user: FiresideHost) {
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
export function setUserMicrophoneAudioVolume(user: FiresideHost, percent: number) {
	user.micPlaybackVolumeLevel = percent;
}

/** Expects a value from 0 to 1 */
export function setUserDesktopAudioVolume(user: FiresideHost, percent: number) {
	user.desktopPlaybackVolumeLevel = percent;
}
