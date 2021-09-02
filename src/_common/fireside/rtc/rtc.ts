import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { debounce, sleep } from '../../../utils/utils';
import { Navigate } from '../../navigate/navigate.service';
import { User } from '../../user/user.model';
import {
	createFiresideRTCChannel,
	destroyChannel,
	FiresideRTCChannel,
	joinChannel,
	setChannelToken,
} from './channel';
import {
	FiresideRTCUser,
	FiresideVideoPlayStateStopped,
	setAudioPlayback,
	setVideoPlayback,
	startAudioPlayback,
	stopAudioPlayback,
	stopDesktopAudioPlayback,
	updateVolumeLevel,
} from './user';

export const FiresideRTCKey = Symbol('fireside-rtc');

/**
 * @deprecated replace with the CancelToken
 */
class GenerationToken {
	isRetired = false;

	/**
	 * Will retire this token and return a new one.
	 */
	retire() {
		this.isRetired = true;
		return new GenerationToken();
	}

	/**
	 * Will throw if this token is retired.
	 */
	assert() {
		if (this.isRetired) {
			throw new Error('Outdated Fireside RTC detected.');
		}
	}
}

export class FiresideRTC {
	generation = new GenerationToken();

	readonly users: FiresideRTCUser[] = [];
	videoChannel: FiresideRTCChannel | null = null;
	chatChannel: FiresideRTCChannel | null = null;
	videoPaused = false;
	focusedUserId: number | null = null;
	volumeLevelInterval: NodeJS.Timer | null = null;
	shouldShowVideoThumbnails = false;
	shouldShowVideoStats = false;

	setupFinalized = false;
	finalizeSetupFn: (() => void) | null = null;

	constructor(
		public readonly userId: number | null,
		public readonly appId: string,
		public readonly videoChannelName: string,
		public videoToken: string | null,
		public readonly chatChannelName: string,
		public chatToken: string | null,
		public readonly hosts: User[]
	) {
		_setup(this);
	}

	log(message: any, ...optionalParams: any[]) {
		console.log('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	logWarning(message: any, ...optionalParams: any[]) {
		console.warn('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	logError(message: any, ...optionalParams: any[]) {
		console.error('[FIRESIDE-RTC] ' + message, ...optionalParams);
	}

	get isHost() {
		return this.userId && this.hosts.find(host => host.id === this.userId) !== undefined;
	}

	/**
	 * If the current user is currently streaming in this fireside. This will
	 * only return valid data once everything gets susbcribed to.
	 */
	get isStreaming() {
		return this.userId && this.users.some(i => i.userId === this.userId);
	}

	get focusedUser() {
		return this.users.find(remoteUser => remoteUser.userId === this.focusedUserId) || null;
	}
}

export async function destroyFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(destroy)');

	// Don't assign a new one so that we stay in a retired state.
	rtc.generation.retire();

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
		await Promise.all([
			videoChannel ? destroyChannel(videoChannel) : Promise.resolve(),
			chatChannel ? destroyChannel(chatChannel) : Promise.resolve(),
		]);
	} catch (e) {
		// reload the page, anything we do now is no longer reliable.
		Navigate.reload();
		return;
	}

	if (rtc.volumeLevelInterval !== null) {
		clearInterval(rtc.volumeLevelInterval);
		rtc.volumeLevelInterval = null;
	}

	rtc.videoChannel = null;
	rtc.chatChannel = null;
	rtc.focusedUserId = null;
	rtc.hosts.splice(0);
}

export async function recreateFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(recreate)');
	await destroyFiresideRTC(rtc);
	return _setup(rtc);
}

export async function renewFiresideRTCToken(
	rtc: FiresideRTC,
	videoToken: string | null,
	audioChatToken: string | null
) {
	rtc.log('Trace(renewToken)');

	if (!rtc.videoChannel || !rtc.chatChannel) {
		throw new Error('Video or chat channels are not defined');
	}

	rtc.log('Renewing audience tokens');
	rtc.videoToken = videoToken;
	rtc.chatToken = audioChatToken;

	if (!rtc.videoToken || !rtc.chatToken) {
		rtc.logWarning('Could not get tokens. The stream likely ended.');
		return;
	}

	const isVideoDisconnected = rtc.videoChannel.isDisconnected;
	const isAudioDisconnected = rtc.chatChannel.isDisconnected;

	// If only one of the clients is fully disconnected, just nuke em both and retry.
	if (isVideoDisconnected !== isAudioDisconnected) {
		rtc.logError(
			'Only one of the clients (video or audio) is connected. Recreating both to get them in sync'
		);
		recreateFiresideRTC(rtc);
		return;
	}

	if (isVideoDisconnected || isAudioDisconnected) {
		rtc.log('Got new audience tokens. Applying by joining...');
		await _join(rtc);
	} else {
		rtc.log('Got new audience tokens. Applying by renewing...');
		await Promise.all([
			setChannelToken(rtc.videoChannel, rtc.videoToken),
			setChannelToken(rtc.chatChannel, rtc.chatToken),
		]);
	}
}

async function _setup(rtc: FiresideRTC) {
	rtc.log('Trace(setup)');

	const gen = rtc.generation.retire();
	rtc.generation = gen;

	_createClients(rtc);

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
		// Run the debounced finalizeSetupFn again if the focusedUserId doesn't
		// exist or match any of our current hosts.
		if (!rtc.focusedUser && rtc.finalizeSetupFn) {
			rtc.finalizeSetupFn();
		}
		return;
	}

	rtc.finalizeSetupFn ??= debounce(() => {
		_chooseFocusedUser(rtc);

		if (!rtc.setupFinalized) {
			rtc.setupFinalized = true;
			rtc.log(`Setup finalized.`);
		}
	}, 500);

	rtc.log(`Debouncing finalize setup.`);
	rtc.finalizeSetupFn();
}

function _createClients(rtc: FiresideRTC) {
	rtc.log('Trace(createClients)');

	(AgoraRTC as any)?.setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);
	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);

	rtc.videoChannel = createFiresideRTCChannel(rtc, rtc.videoChannelName, rtc.videoToken!, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('Got user published (video channel)');

			// To test the lower quality stream
			// rtc.videoClient!.setRemoteVideoStreamType(remoteUser.uid, 1);

			const { user, wasAdded } = _findOrAddUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.videoUser = remoteUser;

			if (mediaType === 'video') {
				user.hasVideo = true;
			} else {
				user.hasDesktopAudio = true;
			}

			if (wasAdded) {
				_userJoined(rtc, user);
			}
			_finalizeSetup(rtc);
		},
		onTrackUnpublish(remoteUser, mediaType) {
			rtc.log('Got user unpublished (video channel)');

			const user = rtc.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			if (mediaType === 'video') {
				setVideoPlayback(user, new FiresideVideoPlayStateStopped());
				user.hasVideo = false;
			} else {
				user.hasDesktopAudio = false;
			}

			_chooseFocusedUser(rtc);
		},
		onUserLeave(remoteUser) {
			rtc.log('Got user left (video channel)');

			const user = rtc.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			// TODO: this will probably error out because it'll fail to "properly"
			// unsubscribe from the track.
			setVideoPlayback(user, new FiresideVideoPlayStateStopped());

			stopDesktopAudioPlayback(user);
			user.videoUser = null;
			user.hasVideo = false;
			user.hasDesktopAudio = false;

			_removeUserIfNeeded(rtc, user);
			_chooseFocusedUser(rtc);
		},
	});

	rtc.chatChannel = createFiresideRTCChannel(rtc, rtc.chatChannelName, rtc.chatToken!, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('got user published (audio chat channel)');

			if (mediaType !== 'audio') {
				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const { user, wasAdded } = _findOrAddUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.audioChatUser = remoteUser;
			user.hasMicAudio = true;

			if (!user.micAudioMuted) {
				startAudioPlayback(user);
			}

			if (wasAdded) {
				_userJoined(rtc, user);
			}
			_finalizeSetup(rtc);
		},
		onTrackUnpublish(remoteUser, mediaType) {
			rtc.log('Got user unpublished (audio channel)');

			// This should never trigger.
			if (mediaType !== 'audio') {
				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const user = rtc.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			stopAudioPlayback(user);
			user.hasMicAudio = false;

			_chooseFocusedUser(rtc);
		},
		onUserLeave(remoteUser) {
			rtc.log('Got user left (audio channel)');

			const user = rtc.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			stopAudioPlayback(user);
			user.audioChatUser = null;
			user.hasMicAudio = false;

			_removeUserIfNeeded(rtc, user);
			_chooseFocusedUser(rtc);
		},
	});
}

async function _join(rtc: FiresideRTC) {
	rtc.log('Trace(join)');

	if (!rtc.videoChannel || !rtc.chatChannel) {
		throw new Error('Video or audio channels are not defined');
	}

	if (!rtc.videoToken || !rtc.chatToken) {
		rtc.log('Audience tokens not provided yet. Not attempting to join');
		return;
	}

	// We set ourselves up as an audience member with the "low latency" level,
	// instead of the ultra low latency which is used for hosts.
	await Promise.all([
		joinChannel(rtc.videoChannel, rtc.appId, 'audience', rtc.videoToken),
		joinChannel(rtc.chatChannel, rtc.appId, 'audience', rtc.chatToken),
	]);
}

function _chooseFocusedUser(rtc: FiresideRTC) {
	// We only choose a new focused user if there isn't one currently set.
	if (rtc.focusedUser) {
		return;
	}

	let bestUser: FiresideRTCUser | null = null;
	let bestScore = -1;

	for (const user of rtc.users) {
		const score =
			(user.hasVideo ? 4 : 0) + (user.hasMicAudio ? 2 : 0) + (user.hasDesktopAudio ? 1 : 0);
		if (score > bestScore) {
			bestUser = user;
			bestScore = score;
		}
	}

	rtc.focusedUserId = bestUser?.userId || null;
}

function _findOrAddUser(
	rtc: FiresideRTC,
	remoteUser: IAgoraRTCRemoteUser
): { user: FiresideRTCUser | null; wasAdded: boolean } {
	let wasAdded = false;
	let user = rtc.users.find(i => i.userId === remoteUser.uid);

	if (!user) {
		if (typeof remoteUser.uid !== 'number') {
			rtc.logWarning('Expected remote user uid to be numeric');
			return { user: null, wasAdded: false };
		}

		user = new FiresideRTCUser(
			rtc,
			remoteUser.uid,
			rtc.hosts.find(host => host.id === remoteUser.uid)
		);
		rtc.users.push(user);
		wasAdded = true;
	}
	return { user, wasAdded };
}

function _removeUserIfNeeded(rtc: FiresideRTC, user: FiresideRTCUser) {
	if (!user.videoUser && !user.audioChatUser) {
		arrayRemove(rtc.users, i => i === user);
		_userLeft(rtc, user);
	}
}

function _userJoined(rtc: FiresideRTC, user: FiresideRTCUser) {
	if (rtc.userId && user.userId === rtc.userId) {
		_handleStreamingBegin(rtc);
	}
}

function _userLeft(rtc: FiresideRTC, user: FiresideRTCUser) {
	if (rtc.userId && user.userId === rtc.userId) {
		_handleStreamingEnd(rtc);
	}
}

function _handleStreamingBegin(rtc: FiresideRTC) {
	if (!rtc.isStreaming) {
		return;
	}

	rtc.videoPaused = true;
	for (const user of rtc.users) {
		setAudioPlayback(user, false);
	}
}

function _handleStreamingEnd(rtc: FiresideRTC) {
	if (rtc.isStreaming) {
		return;
	}

	rtc.videoPaused = false;
	for (const user of rtc.users) {
		setAudioPlayback(user, true);
	}
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	for (const user of rtc.users) {
		updateVolumeLevel(user);
	}
}
