import type {
	AudienceLatencyLevelType,
	ConnectionState,
	IAgoraRTC,
	IAgoraRTCClient,
	IAgoraRTCRemoteUser,
	ILocalAudioTrack,
	ILocalTrack,
	ILocalVideoTrack,
	NetworkQuality,
	SDK_CODEC,
} from 'agora-rtc-sdk-ng';
import { markRaw, reactive } from 'vue';
import { showErrorGrowl } from '../../growls/growls.service';
import { $gettext } from '../../translate/translate.service';
import { FiresideRTC } from './rtc';
import { FiresideRTCUser, setupFiresideVideoElementListeners } from './user';

type OnTrackPublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
type OnTrackUnpublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;

// Everyone on ultra-low latency to try to mitigate the amount of delay between
// chat audio and video.
const DefaultAudienceLevel: AudienceLatencyLevelType = 2;

export class FiresideRTCChannel {
	constructor(public readonly rtc: FiresideRTC, public readonly channel: string) {}

	agoraClient!: IAgoraRTCClient;
	token: string | null = null;

	_localVideoTrack: ILocalVideoTrack | null = null;
	_localAudioTrack: ILocalAudioTrack | null = null;
	_networkQuality: NetworkQuality | null = null;
	_connectionState: ConnectionState | null = null;

	/**
	 * Whether or not we have a track published in this channel. This will
	 * happen once they start streaming in it.
	 */
	_isPublished = false;

	get isDisconnected() {
		return this._connectionState === 'DISCONNECTED';
	}

	get isConnected() {
		return this._connectionState === 'CONNECTED';
	}

	get isPoorNetworkQuality() {
		// Indeterminate doesn't mean poor network quality.
		if (this._networkQuality === null) {
			return false;
		}

		return (
			this._networkQuality.downlinkNetworkQuality >= 4 ||
			this._networkQuality.uplinkNetworkQuality >= 4
		);
	}
}

/// Wraps a [FiresideRTCChannel] in [reactive] after initializing it.
export function createFiresideRTCChannel(
	rtc: FiresideRTC,
	channel: string,
	token: string,
	AgoraRTC: IAgoraRTC,
	{
		onTrackPublish,
		onTrackUnpublish,
	}: {
		onTrackPublish?: OnTrackPublish;
		onTrackUnpublish?: OnTrackUnpublish;
	} = {}
) {
	const { generation } = rtc;

	const c = reactive(new FiresideRTCChannel(rtc, channel)) as FiresideRTCChannel;
	c.token = token;

	let codec: SDK_CODEC = 'vp8';
	const parts = window.location.search.replace('?', '').split('&');

	for (const part of parts) {
		const [key, value] = part.split('=');
		if (!key || !value) {
			continue;
		}

		if (key === 'codec' && ['h264', 'vp8', 'vp9', 'av1'].includes(value)) {
			codec = value as SDK_CODEC;
			rtc.log(`Override codec: ${codec}`);
		}
	}

	c.agoraClient = markRaw(AgoraRTC.createClient({ mode: 'live', codec }));

	c.agoraClient.on('user-published', (...args) => {
		generation.assert();
		onTrackPublish?.(...args);
	});

	c.agoraClient.on('user-unpublished', (...args) => {
		generation.assert();
		onTrackUnpublish?.(...args);
	});

	c.agoraClient.on('network-quality', stats => {
		c._networkQuality = markRaw(stats);
	});

	c.agoraClient.on('connection-state-change', newState => {
		c._connectionState = newState;
	});

	return c;
}

export async function joinChannel(channel: FiresideRTCChannel, token: string) {
	const {
		agoraClient,
		rtc: { appId, streamingUid, generation },
	} = channel;

	channel.token = token;

	// 1 = "low latency" which is used for audience role. It will always use
	// ultra-low latency when role is host.
	await agoraClient.setClientRole('audience', { level: DefaultAudienceLevel });
	generation.assert();

	// TODO: Check if out UID stuff is okay? It should be null for guest.
	const resultUid = await agoraClient.join(appId, channel.channel, token, streamingUid);

	generation.assert();

	if (streamingUid !== resultUid) {
		throw new Error(`Expected uid to be ${streamingUid} but got ${resultUid}.`);
	}
}

export async function destroyChannel(channel: FiresideRTCChannel) {
	if (channel._isPublished) {
		await stopChannelStreaming(channel);
	}

	channel.agoraClient.leave();
	channel.agoraClient.removeAllListeners();
}

export async function setChannelToken(channel: FiresideRTCChannel, token: string) {
	channel.token = token;
	await channel.agoraClient.renewToken(token);
}

export async function setChannelVideoTrack(
	channel: FiresideRTCChannel,
	{
		trackBuilder,
		onTrackClose,
	}: {
		trackBuilder: () => Promise<ILocalVideoTrack | null>;
		onTrackClose?: () => Promise<void>;
	}
) {
	const { agoraClient, rtc } = channel;
	const generation = channel.rtc.generation;

	if (channel._localVideoTrack !== null) {
		rtc.log(`Local video track already exists.`);

		const localTrack = channel._localVideoTrack;
		channel._localVideoTrack = null;

		const isPublished = _isTrackPublished(channel, localTrack);
		if (isPublished) {
			rtc.log(`Local video is already published. Unpublishing first.`);
			await agoraClient.unpublish(localTrack);
			generation.assert();
		}

		rtc.log(`Closing previous local video track.`);
		localTrack.close();

		await onTrackClose?.();
	}

	rtc.log(`Getting new video track.`);
	let newTrack: ILocalVideoTrack | null = null;
	try {
		newTrack = await trackBuilder();
	} catch (e) {
		showErrorGrowl({
			message: $gettext(`Something went wrong trying to use that video device.`),
		});
		channel._localVideoTrack = null;
		return;
	}
	channel._localVideoTrack = newTrack ? markRaw(newTrack) : null;
	generation.assert();

	// Only publish if we are streaming.
	if (channel._localVideoTrack !== null && channel._isPublished) {
		rtc.log(`Publishing new video track.`);
		await agoraClient.publish(channel._localVideoTrack);
	}

	generation.assert();
}

export function previewChannelVideo(
	user: FiresideRTCUser | null,
	channel: FiresideRTCChannel,
	element: HTMLDivElement
) {
	element.innerHTML = '';
	channel._localVideoTrack?.play(element, {
		fit: 'contain',
		mirror: false,
	});

	if (user) {
		setupFiresideVideoElementListeners(element, user);
	}
}

export async function setChannelAudioTrack(
	channel: FiresideRTCChannel,
	{
		trackBuilder,
		onTrackClose,
	}: {
		trackBuilder: () => Promise<ILocalAudioTrack | null>;
		onTrackClose?: () => Promise<void>;
	}
) {
	const { agoraClient, rtc } = channel;
	const generation = channel.rtc.generation;

	if (channel._localAudioTrack !== null) {
		rtc.log(`Local audio track already exists.`);

		const localTrack = channel._localAudioTrack;
		channel._localAudioTrack = null;

		const isPublished = _isTrackPublished(channel, localTrack);
		if (isPublished) {
			rtc.log(`Local audio is already published. Unpublishing first.`);
			await agoraClient.unpublish(localTrack);
			generation.assert();
		}

		rtc.log(`Closing previous local audio track.`);
		localTrack.close();

		await onTrackClose?.();
	}

	rtc.log(`Getting new audio track.`);
	let newTrack: ILocalAudioTrack | null = null;
	try {
		newTrack = await trackBuilder();
	} catch (e) {
		showErrorGrowl({
			message: $gettext(`Something went wrong trying to use that audio device.`),
		});
		channel._localAudioTrack = null;
		return;
	}
	channel._localAudioTrack = newTrack ? markRaw(newTrack) : null;
	generation.assert();

	// Only publish if we are streaming.
	if (channel._localAudioTrack !== null && channel._isPublished) {
		rtc.log(`Publishing new audio track.`);
		await agoraClient.publish(channel._localAudioTrack);
	}

	generation.assert();
}

function _isTrackPublished(channel: FiresideRTCChannel, track: ILocalTrack) {
	return (
		channel.agoraClient.localTracks.find(i => i.getTrackId() === track.getTrackId()) !==
		undefined
	);
}

export async function startChannelStreaming(channel: FiresideRTCChannel) {
	const { agoraClient, rtc } = channel;
	const generation = channel.rtc.generation;

	rtc.log(`Switching to host role.`);
	await agoraClient.setClientRole('host');
	generation.assert();

	rtc.log(`Enabling dual-stream mode.`);
	// Sometimes this fails if the client is already supposedly enabled,
	// but we don't have any way of knowing why this failed.. so we try
	// to disable and reenable.
	try {
		await agoraClient.enableDualStream();
	} catch (e) {
		console.warn(e);
		generation.assert();
		await agoraClient.disableDualStream();
		generation.assert();
		await agoraClient.enableDualStream();
	}
	generation.assert();

	agoraClient.setLowStreamParameter({
		width: 160,
		height: 90,
		framerate: 30,
		bitrate: 350,
	});

	const tracksToPublish = [channel._localVideoTrack, channel._localAudioTrack].filter(
		track => track !== null
	) as ILocalTrack[];

	if (tracksToPublish.length > 0) {
		rtc.log(`Publishing tracks in channel.`);
		await agoraClient.publish(tracksToPublish);
		generation.assert();
	}

	channel._isPublished = true;
	rtc.log(`Started streaming in channel.`);
}

export async function stopChannelStreaming(channel: FiresideRTCChannel) {
	const { agoraClient, rtc } = channel;

	rtc.log(`Stopping stream.`);
	channel._isPublished = false;

	const tracksToUnpublish = [channel._localAudioTrack!, channel._localVideoTrack!].filter(
		i => i !== null && _isTrackPublished(channel, i)
	);

	if (tracksToUnpublish.length > 0) {
		const trackIds = tracksToUnpublish.map(i => i.getTrackId());
		rtc.log(`Unpublishing local tracks: ${trackIds.join(', ')}.`);

		await agoraClient.unpublish(tracksToUnpublish);
	}

	rtc.log(`Setting client role back to audience.`);
	await agoraClient.setClientRole('audience', { level: DefaultAudienceLevel });

	rtc.log(`Stopped streaming.`);
}
