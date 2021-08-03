import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { User } from '../../../_common/user/user.model';
import {
	FiresideRTCUser,
	setWantsVideoTrack,
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

	constructor(
		public readonly userId: number,
		public readonly appId: string,
		public readonly videoChannel: string,
		public videoToken: string | null,
		public readonly audioChatChannel: string,
		public audioChatToken: string | null,
		public readonly hosts: User[]
	) {
		this.videoPaused = this.isHost;
		_setup(this);
	}

	log(message: any) {
		console.log('[FIRESIDE-RTC] ' + message);
	}

	logWarning(message: any) {
		console.warn('[FIRESIDE-RTC] ' + message);
	}

	logError(message: any) {
		console.error('[FIRESIDE-RTC] ' + message);
	}

	get isHost() {
		return this.hosts.find(host => host.id == this.userId) !== undefined;
	}

	get focusedUser() {
		return this.users.find(remoteUser => remoteUser.userId == this.focusedUserId) || null;
	}

	get thumbnailsVisible() {
		return this.shouldShowVideoThumbnails;
	}

	set thumbnailsVisible(visible: boolean) {
		this.shouldShowVideoThumbnails = visible;
		for (const user of this.users) {
			if (this.focusedUserId === user.userId) {
				continue;
			}

			setWantsVideoTrack(user, visible);
		}
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
					setWantsVideoTrack(user, false),
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

	rtc.videoClient.on('user-published', async (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
		rtc.log('Got user published (video channel)');

		// To test the lower quality stream
		// rtc.videoClient!.setRemoteVideoStreamType(remoteUser.uid, 1);

		const user = _findOrAddUser(rtc, remoteUser);
		if (!user) {
			rtc.logWarning(`Couldn't find remote user locally`);
			rtc.logWarning(remoteUser);
			return;
		}

		user.videoUser = remoteUser;

		if (mediaType === 'video') {
			user.hasVideo = true;
		} else {
			user.hasDesktopAudio = true;
		}

		_chooseFocusedUser(rtc);

		// TODO: Do we still need this?
		if (mediaType === 'video') {
			console.log('Current focused user is: ' + rtc.focusedUserId);
			if (rtc.focusedUserId === user.userId || rtc.shouldShowVideoThumbnails) {
				setWantsVideoTrack(user, true);
			}
		}
	});

	rtc.videoClient.on('user-unpublished', async (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
		rtc.log('Got user unpublished (video channel)');

		const user = rtc.users.find(i => i.userId === remoteUser.uid);
		if (!user) {
			rtc.logWarning(`Couldn't find remote user locally`);
			rtc.logWarning(remoteUser);
			return;
		}

		if (mediaType === 'video') {
			setWantsVideoTrack(user, false);
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
			rtc.logWarning(`Couldn't find remote user locally`);
			rtc.logWarning(remoteUser);
			return;
		}

		// TODO: this will probably error out because it'll fail to "properly"
		// unsubscribe from the track.
		setWantsVideoTrack(user, false);

		stopDesktopAudioPlayback(user);
		user.videoUser = null;
		user.hasVideo = false;
		user.hasDesktopAudio = false;

		_removeUserIfNeeded(rtc, user);
		_chooseFocusedUser(rtc);
	});

	rtc.audioClient.on('user-published', async (remoteUser, mediaType) => {
		rtc.assertNotOutdated(currentGeneration);
		rtc.log('got user published (audio chat channel)');

		if (mediaType !== 'audio') {
			rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
			return;
		}

		const user = _findOrAddUser(rtc, remoteUser);
		if (!user) {
			rtc.logWarning(`Couldn't find remote user locally`);
			rtc.logWarning(remoteUser);
			return;
		}

		user.audioChatUser = remoteUser;
		user.hasMicAudio = true;

		if (!user.micAudioMuted) {
			startAudioPlayback(user);
		}

		_chooseFocusedUser(rtc);
	});

	rtc.audioClient.on('user-left', remoteUser => {
		rtc.assertNotOutdated(currentGeneration);
		rtc.log('Got user left (audio channel)');

		const user = rtc.users.find(i => i.userId === remoteUser.uid);
		if (!user) {
			rtc.logWarning(`Couldn't find remote user locally`);
			rtc.logWarning(remoteUser);
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

/**
 * This is currently broken since users currently join one-by-one anyway.
 */
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

function _findOrAddUser(rtc: FiresideRTC, remoteUser: IAgoraRTCRemoteUser): FiresideRTCUser | null {
	let user = rtc.users.find(i => i.userId === remoteUser.uid);
	if (!user) {
		if (typeof remoteUser.uid !== 'number') {
			rtc.logWarning('Expected remote user uid to be numeric');
			return null;
		}

		user = new FiresideRTCUser(
			rtc,
			remoteUser.uid,
			rtc.hosts.find(host => host.id == remoteUser.uid)
		);
		rtc.users.push(user);
	}
	return user;
}

function _removeUserIfNeeded(rtc: FiresideRTC, user: FiresideRTCUser): void {
	if (!user.videoUser && !user.audioChatUser) {
		arrayRemove(rtc.users, i => i === user);
	}
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	for (const user of rtc.users) {
		updateVolumeLevel(user);
	}
}
