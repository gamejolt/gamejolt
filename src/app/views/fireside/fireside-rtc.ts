import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { debounce, sleep } from '../../../utils/utils';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { User } from '../../../_common/user/user.model';
import {
	FiresideRTCUser,
	FiresideVideoPlayStateStopped,
	setAudioPlayback,
	setVideoPlayback,
	startAudioPlayback,
	stopAudioPlayback,
	stopDesktopAudioPlayback,
	updateVolumeLevel,
} from './fireside-rtc-user';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	generation = 0;

	readonly users: FiresideRTCUser[] = [];
	videoClient: IAgoraRTCClient | null = null;
	audioClient: IAgoraRTCClient | null = null;
	videoPaused = false;
	focusedUserId: number | null = null;
	volumeLevelInterval: NodeJS.Timer | null = null;
	shouldShowVideoThumbnails = false;
	shouldShowVideoStats = false;

	setupFinalized = false;
	finalizeSetupFn: (() => void) | null = null;

	constructor(
		public readonly userId: number,
		public readonly appId: string,
		public readonly videoChannel: string,
		public videoToken: string | null,
		public readonly audioChatChannel: string,
		public audioChatToken: string | null,
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
		return this.hosts.find(host => host.id == this.userId) !== undefined;
	}

	/**
	 * If the current user is currently streaming in this fireside. This will
	 * only return valid data once everything gets susbcribed to.
	 */
	get isStreaming() {
		return this.users.some(i => i.userId === this.userId);
	}

	get focusedUser() {
		return this.users.find(remoteUser => remoteUser.userId == this.focusedUserId) || null;
	}

	public assertNotOutdated(myGeneration: number) {
		if (myGeneration !== this.generation) {
			throw new Error('Outdated Fireside RTC generation detected');
		}
	}
}

export async function destroyFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(destroy)');

	rtc.generation++;

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

	try {
		await Promise.all([
			rtc.videoClient ? rtc.videoClient.leave() : Promise.resolve(),
			rtc.audioClient ? rtc.audioClient.leave() : Promise.resolve(),
		]);
	} catch (e) {
		// reload the page, anything we do now is no longer reliable.
		Navigate.reload();
		return;
	}

	rtc.videoClient?.removeAllListeners();
	rtc.audioClient?.removeAllListeners();

	if (rtc.volumeLevelInterval !== null) {
		clearInterval(rtc.volumeLevelInterval);
		rtc.volumeLevelInterval = null;
	}

	rtc.videoClient = null;
	rtc.audioClient = null;
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

	if (!rtc.videoClient || !rtc.audioClient) {
		throw new Error('Video or audio clients are not defined');
	}

	rtc.log('Renewing audience tokens');
	rtc.videoToken = videoToken;
	rtc.audioChatToken = audioChatToken;

	if (!rtc.videoToken || !rtc.audioChatToken) {
		rtc.logWarning('Could not get tokens. The stream likely ended.');
		return;
	}

	const isVideoDisconnected = rtc.videoClient.connectionState === 'DISCONNECTED';
	const isAudioDisconnected = rtc.audioClient.connectionState === 'DISCONNECTED';
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
			rtc.videoClient.renewToken(rtc.videoToken),
			rtc.audioClient.renewToken(rtc.audioChatToken),
		]);
	}
}

async function _setup(rtc: FiresideRTC) {
	rtc.log('Trace(setup)');

	rtc.generation++;
	const currentGen = rtc.generation;

	_createClients(rtc);
	_setupEvents(rtc);

	for (let i = 0; i < 5; i++) {
		try {
			await _join(rtc);
			break;
		} catch (e) {
			rtc.logError('Failed to join');
			rtc.logError(e);
			await sleep(2000);
			rtc.assertNotOutdated(currentGen);
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

	(AgoraRTC as any).setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);

	rtc.videoClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
	rtc.audioClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);
}

function _setupEvents(rtc: FiresideRTC) {
	rtc.log('Trace(setupEvents)');
	const currentGeneration = rtc.generation;
	if (!rtc.videoClient || !rtc.audioClient) {
		throw new Error('Video or audio clients are not defined');
	}

	rtc.videoClient.on('user-published', (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
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
	});

	rtc.videoClient.on('user-unpublished', (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
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
	});

	rtc.videoClient.on('user-left', remoteUser => {
		rtc.assertNotOutdated(currentGeneration);
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
	});

	rtc.audioClient.on('user-published', (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
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
	});

	rtc.audioClient.on('user-unpublished', (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
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
	});

	rtc.audioClient.on('user-left', remoteUser => {
		rtc.assertNotOutdated(currentGeneration);
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
	});
}

async function _join(rtc: FiresideRTC) {
	rtc.log('Trace(join)');
	const currentGeneration = rtc.generation;

	if (!rtc.videoClient || !rtc.audioClient) {
		throw new Error('Video or audio clients are not defined');
	}

	const videoClient = rtc.videoClient;
	const audioClient = rtc.audioClient;

	if (!rtc.videoToken || !rtc.audioChatToken) {
		rtc.log('Audience tokens not provided yet. Not attempting to join');
		return;
	}

	// We set ourselves up as an audience member with the "low latency" level,
	// instead of the ultra low latency which is used for hosts.
	await Promise.all([
		rtc.videoClient.setClientRole('audience', { level: 1 }).then(() => {
			rtc.assertNotOutdated(currentGeneration);
			return videoClient.join(rtc.appId, rtc.videoChannel, rtc.videoToken, null);
		}),
		rtc.audioClient.setClientRole('audience', { level: 1 }).then(() => {
			rtc.assertNotOutdated(currentGeneration);
			return audioClient.join(rtc.appId, rtc.audioChatChannel, rtc.audioChatToken, null);
		}),
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
			rtc.hosts.find(host => host.id == remoteUser.uid)
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
	if (user.userId === rtc.userId) {
		_handleStreamingBegin(rtc);
	}
}

function _userLeft(rtc: FiresideRTC, user: FiresideRTCUser) {
	if (user.userId === rtc.userId) {
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
