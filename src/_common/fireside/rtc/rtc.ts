import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';
import { CancelToken } from '../../../utils/cancel-token';
import { debounce, sleep } from '../../../utils/utils';
import { Navigate } from '../../navigate/navigate.service';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';
import { FiresideRole } from '../role/role.model';
import {
	createFiresideRTCChannel,
	destroyChannel,
	FiresideRTCChannel,
	joinChannel,
	setChannelToken,
} from './channel';
import {
	createFiresideRTCProducer,
	destroyFiresideRTCProducer,
	FiresideRTCProducer,
} from './producer';
import {
	FiresideRTCUser,
	FiresideVideoPlayStateStopped,
	setUserHasDesktopAudio,
	setUserHasMicAudio,
	setUserHasVideo,
	setVideoPlayback,
	stopAudioPlayback,
	stopDesktopAudioPlayback,
	updateVolumeLevel,
} from './user';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	constructor(
		public readonly fireside: Fireside,
		public readonly role: FiresideRole | null,
		public readonly userId: number | null,
		public readonly appId: string,
		public readonly videoChannelName: string,
		public videoToken: string,
		public readonly chatChannelName: string,
		public chatToken: string,
		public readonly hosts: User[]
	) {}

	generation = new CancelToken();

	// These channels will get created immediately in the setup.
	videoChannel!: FiresideRTCChannel;
	chatChannel!: FiresideRTCChannel;

	readonly users: FiresideRTCUser[] = [];
	videoPaused = false;
	focusedUserId: number | null = null;
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
	 * Returns a local [FiresideRTCUser] if they're currently streaming.
	 */
	get localUser() {
		if (!this.userId) {
			return null;
		}

		return this.users.find(i => i.userId === this.userId) ?? null;
	}

	/**
	 * If the current user is currently streaming in this fireside. This will
	 * only return valid data once everything gets susbcribed to.
	 */
	get isStreaming() {
		return this.localUser !== null;
	}

	get focusedUser() {
		return this.users.find(remoteUser => remoteUser.userId === this.focusedUserId) ?? null;
	}

	get isPoorNetworkQuality() {
		return this.videoChannel.isPoorNetworkQuality || this.chatChannel.isPoorNetworkQuality;
	}
}

export function createFiresideRTC(
	fireside: Fireside,
	role: FiresideRole | null,
	userId: number | null,
	appId: string,
	videoChannelName: string,
	videoToken: string,
	chatChannelName: string,
	chatToken: string,
	hosts: User[]
) {
	const rtc = new FiresideRTC(
		fireside,
		role,
		userId,
		appId,
		videoChannelName,
		videoToken,
		chatChannelName,
		chatToken,
		hosts
	);

	_setup(rtc);
	return rtc;
}

export async function destroyFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(destroy)');

	// Don't assign a new one so that we stay in a canceled state.
	rtc.generation.cancel();

	if (rtc.producer) {
		destroyFiresideRTCProducer(rtc.producer);
		rtc.producer = null;
	}

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
		await Promise.all([destroyChannel(videoChannel), destroyChannel(chatChannel)]);
	} catch (e) {
		// reload the page, anything we do now is no longer reliable.
		Navigate.reload();
		return;
	}

	if (rtc.volumeLevelInterval !== null) {
		clearInterval(rtc.volumeLevelInterval);
		rtc.volumeLevelInterval = null;
	}

	rtc.focusedUserId = null;
	rtc.hosts.splice(0);
}

export async function recreateFiresideRTC(rtc: FiresideRTC) {
	rtc.log('Trace(recreate)');
	await destroyFiresideRTC(rtc);
	return _setup(rtc);
}

/**
 * Renews specifically for audience tokens. If they're a host, this will
 * essentially be ignored.
 */
export async function renewRTCAudienceTokens(
	rtc: FiresideRTC,
	videoToken: string,
	chatToken: string
) {
	if (rtc.role?.canStream) {
		return;
	}

	return await renewRTCTokens(rtc, videoToken, chatToken);
}

export async function renewRTCTokens(rtc: FiresideRTC, videoToken: string, chatToken: string) {
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
		recreateFiresideRTC(rtc);
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

	_createChannels(rtc);
	_createProducer(rtc);

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
		chooseFocusedRTCUser(rtc);

		if (!rtc.setupFinalized) {
			rtc.setupFinalized = true;
			rtc.log(`Setup finalized.`);
		}
	}, 500);

	rtc.log(`Debouncing finalize setup.`);
	rtc.finalizeSetupFn();
}

function _createChannels(rtc: FiresideRTC) {
	rtc.log('Trace(createChannels)');

	(AgoraRTC as any)?.setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);
	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);

	rtc.videoChannel = createFiresideRTCChannel(rtc, rtc.videoChannelName, rtc.videoToken, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('Got user published (video channel)');

			const user = _findOrAddUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.remoteVideoUser = remoteUser;

			if (mediaType === 'video') {
				setUserHasVideo(user, true);
			} else {
				setUserHasDesktopAudio(user, true);
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
				setUserHasVideo(user, false);
			} else {
				setUserHasDesktopAudio(user, false);
			}

			_removeUserIfNeeded(rtc, user);
		},
	});

	rtc.chatChannel = createFiresideRTCChannel(rtc, rtc.chatChannelName, rtc.chatToken, {
		onTrackPublish(remoteUser, mediaType) {
			rtc.log('got user published (audio chat channel)');

			if (mediaType !== 'audio') {
				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const user = _findOrAddUser(rtc, remoteUser);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			user.remoteChatUser = remoteUser;
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

			const user = rtc.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
				return;
			}

			setUserHasMicAudio(user, false);
			_removeUserIfNeeded(rtc, user);
		},
	});
}

function _createProducer(rtc: FiresideRTC) {
	if (rtc.role?.canStream !== true) {
		return;
	}

	rtc.producer = createFiresideRTCProducer(rtc);
}

async function _join(rtc: FiresideRTC) {
	rtc.log('Trace(join)');

	await Promise.all([
		joinChannel(rtc.videoChannel, rtc.videoToken),
		joinChannel(rtc.chatChannel, rtc.chatToken),
	]);
}

export function chooseFocusedRTCUser(rtc: FiresideRTC) {
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

function _findOrAddUser(rtc: FiresideRTC, remoteUser: IAgoraRTCRemoteUser) {
	let user = rtc.users.find(i => i.userId === remoteUser.uid);

	if (!user) {
		if (typeof remoteUser.uid !== 'number') {
			rtc.logWarning('Expected remote user uid to be numeric');
			return null;
		}

		user = new FiresideRTCUser(rtc, remoteUser.uid);
		rtc.users.push(user);
	}

	return user;
}

function _removeUserIfNeeded(rtc: FiresideRTC, user: FiresideRTCUser) {
	// We remove once all their tracks are gone.
	if (user.hasVideo || user.hasDesktopAudio || user.hasMicAudio) {
		return;
	}

	user.remoteVideoUser = null;
	user.remoteChatUser = null;

	arrayRemove(rtc.users, i => i === user);
	chooseFocusedRTCUser(rtc);
}

function _updateVolumeLevels(rtc: FiresideRTC) {
	for (const user of rtc.users) {
		updateVolumeLevel(user);
	}
}
