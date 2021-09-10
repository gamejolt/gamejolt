import type {
	IAgoraRTCRemoteUser,
	ILocalAudioTrack,
	ILocalVideoTrack,
	IRemoteAudioTrack,
	IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { chooseFocusedRTCUser, FiresideRTC } from './rtc';

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
	constructor(public readonly rtc: FiresideRTC, public readonly userId: number) {
		// If everyone is currently muted, add new users as muted.
		this.micAudioMuted = rtc.users.length > 0 ? rtc.users.every(i => i.micAudioMuted) : false;
	}

	// These won't be assigned if this is the local user.
	remoteVideoUser: IAgoraRTCRemoteUser | null = null;
	remoteChatUser: IAgoraRTCRemoteUser | null = null;

	_videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null = null;
	_desktopAudioTrack: ILocalAudioTrack | IRemoteAudioTrack | null = null;
	_micAudioTrack: ILocalAudioTrack | IRemoteAudioTrack | null = null;

	hasVideo = false;
	videoPlayState: FiresideVideoPlayState = new FiresideVideoPlayStateStopped();
	queuedVideoPlayState: FiresideVideoPlayState | null = null;
	readonly videoLocks: FiresideVideoLock[] = [];

	hasDesktopAudio = false;

	hasMicAudio = false;
	micAudioMuted = false;
	volumeLevel = 0;

	get userModel() {
		return this.rtc.hosts.find(host => host.id === this.userId);
	}
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

		if (!user.micAudioMuted) {
			startAudioPlayback(user);
		}
	} else {
		stopAudioPlayback(user);
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

	// If user doesnt have a video stream to subscribe/unsubscribe to, nothing to do.
	if (!user.hasVideo) {
		rtc.log('No video or no video client');
		return;
	}

	const wasQueued = user.queuedVideoPlayState !== null;
	user.queuedVideoPlayState = newState;

	if (wasQueued) {
		rtc.log('Queue up new video play state change, we are already busy.', { ...newState });
		return;
	}

	// If user is already in the desired state for video subscriptions, noop.
	if (_comparePlayState(user.videoPlayState, newState)) {
		rtc.log('Already in desired state.', {
			newState: { ...newState },
			existingState: { ...user.videoPlayState },
		});

		// If our play state is what we wanted and a new one hasn't been
		// assigned, clear out the queued state.
		if (user.queuedVideoPlayState === newState) {
			user.queuedVideoPlayState = null;
		}
		return;
	}

	rtc.log('Setting new play state.', { ...newState });

	if (newState instanceof FiresideVideoPlayStatePlaying) {
		try {
			// If they're a remote user, we need to subscribe to their video first.
			if (user.remoteVideoUser) {
				user._videoTrack = await rtc.videoChannel.agoraClient.subscribe(
					user.remoteVideoUser,
					'video'
				);
			}

			// Wait for next tick before playing so that any video playback elements
			// are first deregistered.
			await sleep(0);

			user._videoTrack?.play(newState.element);

			// TODO: Test to make sure this doesn't fail if we're trying to set against a local user.
			rtc.videoChannel.agoraClient.setRemoteVideoStreamType(
				user.userId,
				newState.isLowBitrate ? 1 : 0
			);
		} catch (e) {
			rtc.logError('Failed to subscribe to video for user ' + user.userId, e);
		}
	} else if (newState instanceof FiresideVideoPlayStateStopped) {
		try {
			if (user._videoTrack?.isPlaying) {
				try {
					user._videoTrack.stop();
				} catch (e) {
					rtc.logWarning(
						`Got an error while stopping a video track for user ${user.userId}. Tolerating.`,
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
			rtc.logError('Failed to subscribe to video thumbnails for user ' + user.userId, e);
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

	rtc.log(`${user.userId} -> startDesktopAudioPlayback`);

	try {
		// Only subscribe for remote users.
		if (user.remoteVideoUser) {
			user._desktopAudioTrack = await rtc.videoChannel.agoraClient.subscribe(
				user.remoteVideoUser,
				'audio'
			);
		}

		user._desktopAudioTrack?.play();
	} catch (e) {
		rtc.logError('Failed to start desktop audio playback, attempting to gracefully stop.', e);

		stopDesktopAudioPlayback(user);
		throw e;
	}
}

export async function stopDesktopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${user.userId} -> stopDesktopAudioPlayback`);

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

	rtc.log(`${user.userId} -> startAudioPlayback`);

	if (!user.remoteChatUser) {
		return;
	}

	try {
		user._micAudioTrack = await rtc.chatChannel.agoraClient.subscribe(
			user.remoteChatUser,
			'audio'
		);

		user._micAudioTrack.play();
	} catch (e) {
		rtc.logError('Failed to start video playback, attempting to gracefully stop.', e);

		stopAudioPlayback(user);
		throw e;
	}
}

export async function stopAudioPlayback(user: FiresideRTCUser) {
	const { rtc } = user;

	rtc.log(`${user.userId} -> stopAudioPlayback`);

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
	if (!user.remoteChatUser || user._micAudioTrack?.isPlaying !== true) {
		user.volumeLevel = 0;
		return;
	}

	user.volumeLevel = user._micAudioTrack.getVolumeLevel();
}
