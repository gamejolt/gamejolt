import { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { User } from '../../../_common/user/user.model';
import { FiresideRTC } from './fireside-rtc';

export class FiresideVideoPlayStatePlaying {
	isPlaying = true;
	constructor(public readonly element: HTMLDivElement, public readonly isLowBitrate: boolean) {}
}

export class FiresideVideoPlayStateStopped {
	isPlaying = false;
}

export type FiresideVideoPlayState = FiresideVideoPlayStatePlaying | FiresideVideoPlayStateStopped;

function _comparePlayState(a: FiresideVideoPlayState, b: FiresideVideoPlayState) {
	if (a === b) {
		return true;
	}

	if (a instanceof FiresideVideoPlayStatePlaying && b instanceof FiresideVideoPlayStatePlaying) {
		return a.element === b.element && a.isLowBitrate === b.isLowBitrate;
	}

	return a.isPlaying === b.isPlaying;
}

export class FiresideVideoLock {
	released = false;
}

export class FiresideRTCUser {
	videoUser: IAgoraRTCRemoteUser | null = null;
	audioChatUser: IAgoraRTCRemoteUser | null = null;

	hasVideo = false;
	videoTrack: IRemoteVideoTrack | null = null;
	videoPlayState: FiresideVideoPlayState = new FiresideVideoPlayStateStopped();
	queuedVideoPlayState: FiresideVideoPlayState | null = null;
	readonly videoLocks: FiresideVideoLock[] = [];

	hasDesktopAudio = false;
	desktopAudioTrack: IRemoteAudioTrack | null = null;

	hasMicAudio = false;
	micAudioMuted = false;
	micAudioTrack: IRemoteAudioTrack | null = null;

	volumeLevel = 0;

	constructor(
		public readonly rtc: FiresideRTC,
		public readonly userId: number,
		public readonly userModel: User | undefined
	) {
		// TODO: If anyone at all is unmuted, we can let people enter unmuted when they're a host.
		this.micAudioMuted = rtc.isHost;
	}
}

/**
 * THis should be called before playing a video. [releaseVideoLock] must be
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
	arrayRemove(user.videoLocks, i => i === lock);

	// When there's no more locks, stop the video.
	if (!user.videoLocks.length) {
		setVideoPlayback(user, new FiresideVideoPlayStateStopped());
	}
}

/**
 * Used to set the new state for video playback for a [FiresideRTCUser]. Make
 * sure to acquire/release the appropriate locks, or things may get out of sync.
 */
export async function setVideoPlayback(user: FiresideRTCUser, newState: FiresideVideoPlayState) {
	const { rtc } = user;

	if (!rtc.videoClient) {
		console.warn(
			'Video client is not initialized, cannot toggle video thumbnail subscription state'
		);
		return;
	}

	// If user doesnt have a video stream to subscribe/unsubscribe to, nothing to do.
	if (!user.hasVideo || !user.videoUser) {
		console.log('No video or no video client');
		return;
	}

	const wasQueued = user.queuedVideoPlayState !== null;
	user.queuedVideoPlayState = newState;

	if (wasQueued) {
		console.log('Queue up new video play state change, we are already busy.', { ...newState });
		return;
	}

	// If user is already in the desired state for video subscriptions, noop.
	if (_comparePlayState(user.videoPlayState, newState)) {
		console.log('Already in desired state.', {
			newState: { ...newState },
			existingState: { ...user.videoPlayState },
		});
		return;
	}

	console.log('Setting new play state.', { ...newState });

	if (newState instanceof FiresideVideoPlayStatePlaying) {
		try {
			user.videoTrack = await rtc.videoClient.subscribe(user.videoUser, 'video');

			// Wait for next tick before playing so that any video playback elements
			// are first deregistered.
			await sleep(0);

			if (user.videoTrack) {
				user.videoTrack.play(newState.element);
				rtc.videoClient!.setRemoteVideoStreamType(
					user.userId,
					newState.isLowBitrate ? 1 : 0
				);
			}
		} catch (e) {
			console.error('Failed to subscribe to video for user ' + user.userId);
			console.error(e);
		}
	} else if (newState instanceof FiresideVideoPlayStateStopped) {
		try {
			if (user.videoTrack?.isPlaying) {
				try {
					user.videoTrack.stop();
				} catch (e) {
					console.warn(
						`Got an error while stopping a video track for user ${user.userId}. Tolerating.`
					);
					console.warn(e);
				}
			}

			await rtc.videoClient.unsubscribe(user.videoUser, 'video');

			// TODO: we might want to set the video track to null even
			// before unsubscribing. this is because unsubscribe may fail if
			// we already left the channel or it got disconnected for some
			// reason. in these cases the video track should still get
			// unset, however I don't know what happens if the error is
			// literally with unsubscribing, and the video track remains
			// intact.
			user.videoTrack = null;

			// Make sure all the locks are released (just in case).
			for (const lock of user.videoLocks) {
				lock.released = true;
			}
			user.videoLocks.splice(0);
		} catch (e) {
			console.error('Failed to subscribe to video thumbnails for user ' + user.userId);
			console.error(e);
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
	console.log(`FiresideRTCUser(${user.userId}) -> startDesktopAudioPlayback`);
	if (!user.videoUser || !rtc.videoClient) {
		return;
	}

	try {
		user.desktopAudioTrack = await rtc.videoClient.subscribe(user.videoUser, 'audio');
		user.desktopAudioTrack.play();
	} catch (e) {
		console.error('Failed to start desktop audio playback, attempting to gracefully stop.');
		console.error(e);

		stopDesktopAudioPlayback(user);
		throw e;
	}
}

export async function stopDesktopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;
	console.log(`FiresideRTCUser(${user.userId}) -> stopDesktopAudioPlayback`);
	if (!user.videoUser) {
		return;
	}

	if (user.desktopAudioTrack && user.desktopAudioTrack.isPlaying) {
		console.log('Stopping existing desktop audio track');
		try {
			user.desktopAudioTrack.stop();
		} catch (e) {
			console.warn('Failed to stop desktop audio track playback');
			console.warn(e);
		}
	}
	user.desktopAudioTrack = null;

	if (rtc.videoClient) {
		try {
			await rtc.videoClient.unsubscribe(user.videoUser, 'audio');
		} catch (e) {
			console.warn(
				'Failed to unsbuscribe to desktop audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.'
			);
		}
	}
}

export function setAudioPlayback(user: FiresideRTCUser, isPlaying: boolean) {
	user.micAudioMuted = !isPlaying;

	if (user.micAudioMuted) {
		stopAudioPlayback(user);
	} else {
		startAudioPlayback(user);
	}
}

export async function startAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;
	console.log(`FiresideRTCUser(${user.userId}) -> startAudioPlayback`);
	if (!user.audioChatUser || !rtc.audioClient) {
		return;
	}

	try {
		user.micAudioTrack = await rtc.audioClient.subscribe(user.audioChatUser, 'audio');
		user.micAudioTrack.play();
	} catch (e) {
		console.error('Failed to start video playback, attempting to gracefully stop.');
		console.error(e);

		stopAudioPlayback(user);
		throw e;
	}
}

export async function stopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;
	console.log(`FiresideRTCUser(${user.userId}) -> stopAudioPlayback`);
	if (!user.audioChatUser) {
		return;
	}

	if (user.micAudioTrack?.isPlaying) {
		console.log('Stopping existing audio track');
		try {
			user.micAudioTrack.stop();
		} catch (e) {
			console.warn('Failed to stop mic audio track playback');
			console.warn(e);
		}
	}
	user.micAudioTrack = null;

	// Don't care if these fail, best effort.
	if (rtc.audioClient) {
		try {
			await rtc.audioClient.unsubscribe(user.audioChatUser, 'audio');
		} catch (e) {
			console.warn(
				'Failed to unsbuscribe to mic audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.'
			);
		}
	}
}

export function updateVolumeLevel(user: FiresideRTCUser) {
	if (!user.audioChatUser || !user.micAudioTrack?.isPlaying) {
		user.volumeLevel = 0;
		return;
	}

	user.volumeLevel = user.micAudioTrack.getVolumeLevel();
}
