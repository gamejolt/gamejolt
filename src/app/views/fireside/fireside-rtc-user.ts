import { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { User } from '../../../_common/user/user.model';
import { FiresideRTC } from './fireside-rtc';

interface PlaybackElement {
	div: HTMLDivElement;
	isLowBitrate: boolean;
}

export class FiresideRTCUser {
	videoUser: IAgoraRTCRemoteUser | null = null;
	audioChatUser: IAgoraRTCRemoteUser | null = null;

	hasVideo = false;
	videoTrack: IRemoteVideoTrack | null = null;
	wantsVideoTrack = false;
	isBusyWithVideoTrack = false;

	hasDesktopAudio = false;
	desktopAudioTrack: IRemoteAudioTrack | null = null;

	hasMicAudio = false;
	micAudioMuted = false;
	micAudioTrack: IRemoteAudioTrack | null = null;

	volumeLevel = 0;
	readonly videoPlaybackElements: PlaybackElement[] = [];

	constructor(
		public readonly rtc: FiresideRTC,
		public readonly userId: number,
		public readonly userModel: User | undefined
	) {
		// TODO: If anyone at all is unmuted, we can let people enter unmuted when they're a host.
		this.micAudioMuted = rtc.isHost;
	}
}

export async function setWantsVideoTrack(user: FiresideRTCUser, wantsVideoTrack: boolean) {
	const { rtc } = user;

	user.wantsVideoTrack = wantsVideoTrack;

	if (user.isBusyWithVideoTrack) {
		console.log('busy');
		return;
	}

	if (!rtc.videoClient) {
		console.warn(
			'Video client is not initialized, cannot toggle video thumbnail subscription state'
		);
		return;
	}

	// If user doesnt have a video stream to subscribe/unsubscribe to, nothing to do.
	if (!user.hasVideo || !user.videoUser) {
		console.log('no video or no video client');
		return;
	}

	// If user is already in the desired state for video subscriptions, noop.
	if (wantsVideoTrack === !!user.videoTrack) {
		console.log('already in desired state');
		return;
	}

	user.isBusyWithVideoTrack = true;

	try {
		if (wantsVideoTrack) {
			try {
				user.videoTrack = await rtc.videoClient.subscribe(user.videoUser, 'video');

				for (const playbackElement of user.videoPlaybackElements) {
					try {
						// Wait for next tick before playing so that any video playback elements
						// are first deregistered.
						setTimeout(() => {
							if (user.videoTrack) {
								user.videoTrack.play(playbackElement.div);
								rtc.videoClient!.setRemoteVideoStreamType(
									user.userId,
									playbackElement.isLowBitrate ? 1 : 0
								);
							}
						}, 0);
					} catch (e) {
						console.error(
							`Failed to play video track for user ${user.userId} on a playback element ${playbackElement.div.id}`
						);
						console.error(e);
					}
				}
			} catch (e) {
				console.error('Failed to subscribe to video thumbnails for user ' + user.userId);
				console.error(e);
			}
		} else {
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
			} catch (e) {
				console.error('Failed to subscribe to video thumbnails for user ' + user.userId);
				console.error(e);
			}
		}
	} finally {
		user.isBusyWithVideoTrack = false;
	}

	// If the operation's state doesn't match up with our desired state, toggle the thumbnails again.
	if (user.wantsVideoTrack !== wantsVideoTrack) {
		await setWantsVideoTrack(user, user.wantsVideoTrack);
	}
}

export function registerVideoPlaybackElement(
	user: FiresideRTCUser,
	element: HTMLDivElement,
	isLowBitrate = false
) {
	const { rtc } = user;
	user.videoPlaybackElements.push({ div: element, isLowBitrate });

	if (user.isBusyWithVideoTrack) {
		return;
	}

	// Wait for next tick before playing so that any video playback elements
	// are first deregistered.
	setTimeout(() => {
		if (user.videoTrack) {
			user.videoTrack.play(element);
			rtc.videoClient!.setRemoteVideoStreamType(user.userId, isLowBitrate ? 1 : 0);
		}
	}, 0);
}

export function deregisterVideoPlaybackElement(user: FiresideRTCUser, element: HTMLDivElement) {
	arrayRemove(user.videoPlaybackElements, i => i.div === element);
	element.innerHTML = '';
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
