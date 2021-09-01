import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { FiresideRTC } from './rtc';

type OnTrackPublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
type OnTrackUnpublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
type OnUserLeave = (remoteUser: IAgoraRTCRemoteUser, reason?: string) => void;

export class FiresideRTCChannel {
	constructor(public readonly rtc: FiresideRTC, public readonly channel: string) {}

	agoraClient!: IAgoraRTCClient;
	token: string | null = null;

	get isDisconnected() {
		return this.agoraClient.connectionState === 'DISCONNECTED';
	}

	get isConnected() {
		return this.agoraClient.connectionState === 'CONNECTED';
	}
}

export function createFiresideRTCChannel(
	rtc: FiresideRTC,
	channel: string,
	token: string,
	{
		onTrackPublish,
		onTrackUnpublish,
		onUserLeave,
	}: {
		onTrackPublish?: OnTrackPublish;
		onTrackUnpublish?: OnTrackUnpublish;
		onUserLeave?: OnUserLeave;
	} = {}
) {
	const gen = rtc.generation;

	const c = new FiresideRTCChannel(rtc, channel);
	c.token = token;
	c.agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });

	c.agoraClient.on('user-published', (...args) => {
		gen.assert();
		onTrackPublish?.(...args);
	});

	c.agoraClient.on('user-unpublished', (...args) => {
		gen.assert();
		onTrackUnpublish?.(...args);
	});

	c.agoraClient.on('user-left', (...args) => {
		gen.assert();
		onUserLeave?.(...args);
	});

	return c;
}

export async function joinChannel(
	channel: FiresideRTCChannel,
	appId: string,
	role: 'audience' | 'host',
	token: string
) {
	const gen = channel.rtc.generation;
	channel.token = token;

	// 1 = "low latency" which is used for audience role. It will always use
	// ultra-low latency when role is host.
	await channel.agoraClient.setClientRole(role, { level: 1 });
	gen.assert();

	// TODO: Pass in uid if host?
	const uid = await channel.agoraClient.join(appId, channel.channel, token);
	gen.assert();

	return uid;
}

export async function destroyChannel(channel: FiresideRTCChannel) {
	channel.agoraClient.leave();
	channel.agoraClient.removeAllListeners();
}

export async function setChannelToken(channel: FiresideRTCChannel, token: string) {
	await channel.agoraClient.renewToken(token);
}
