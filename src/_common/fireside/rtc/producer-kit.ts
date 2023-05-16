import OvenLiveKitStatic, { OvenLiveKitCodec } from 'ovenlivekit';
import { markRaw, ref, shallowReadonly, shallowRef } from 'vue';
import { createLogger } from '../../../utils/logging';
import { showErrorGrowl } from '../../growls/growls.service';
import { $gettext } from '../../translate/translate.service';
import { VolumeMonitor, createVolumeMonitor } from '../volume-monitor';
import { FiresideHost } from './host';

export type FiresideProducerKit = ReturnType<typeof createFiresideProducerKit>;

export function createFiresideProducerKit({
	streamType,
	host,
}: {
	streamType: 'video' | 'chat';
	host: FiresideHost;
}) {
	const logger = createLogger(`Fireside Producer Kit (${streamType})`);

	const ovenClient = OvenLiveKitStatic.create({
		callbacks: {
			error: error => console.error(error),
			connected: event => {
				console.log('connected', event);
				isConnected.value = true;
			},
			connectionClosed: (type, event) => {
				console.log('connection closed', type, event);
				isConnected.value = false;
			},
			iceStateChange: state => console.log('ice state changed', state),
		},
	});

	const localStream = shallowRef<MediaStream | null>(null);
	const volumeMonitor = shallowRef<VolumeMonitor | null>(null);
	const isConnected = ref(false);

	return shallowReadonly({
		streamType,
		host,
		ovenClient,
		localStream,
		volumeMonitor,
		isConnected,
		logger,
	});
}

export async function destroyFiresideProducerKit({
	volumeMonitor,
	isConnected,
}: FiresideProducerKit) {
	await volumeMonitor.value?.close();
	volumeMonitor.value = null;

	isConnected.value = false;

	// TODO(oven): do we want to also call onStreamClose?
	// TODO(oven): do we want to also call stop streaming on the ovenclient?
}

export async function setKitMediaStream(
	{ ovenClient, localStream, volumeMonitor, logger }: FiresideProducerKit,
	{
		streamBuilder,
		onStreamClose,
	}: {
		streamBuilder: () => Promise<MediaStream | null>;
		onStreamClose?: () => Promise<void>;
	}
) {
	if (localStream.value !== null) {
		logger.info(`Local stream already exists.`);

		// Stop monitoring the volume.
		await volumeMonitor.value?.close();
		localStream.value = null;

		// This will close the websocket, stop streaming, and remove the input
		// stream from oven client. It will stop all the tracks from the input
		// stream and remove them from the stream. That basically resets us
		// completely and we can add the new stream in. When
		// getUserMedia/getDisplayMedia is called on the oven client again, it
		// will add the new stream into it.
		//
		// From what I can tell, everything that this calls happens
		// synchronously, so we don't need to await anything.
		ovenClient.remove();

		await onStreamClose?.();
	}

	logger.info(`Getting new stream.`);
	let newStream: MediaStream | null = null;
	try {
		newStream = await streamBuilder();
	} catch (e) {
		showErrorGrowl({
			message: $gettext(`Something went wrong trying to use that video device.`),
		});
		return;
	}

	localStream.value = newStream ? markRaw(newStream) : null;

	// There won't be an audio track if they're just streaming their video
	// without desktop audio.
	if (newStream && newStream.getAudioTracks().length > 0) {
		volumeMonitor.value = createVolumeMonitor(newStream);
	}

	// TODO(oven): for oven we would want to hook into the rtc and input stream
	// and modify so that we are streaming out the new tracks.

	// // Only publish if we are streaming.
	// if (localStream.value !== null && channel._isPublished) {
	// 	rtc.log(`Publishing new video track.`);
	// 	await agoraClient.publish(localStream.value);
	// }
}

export function startKitStreaming({
	host,
	ovenClient,
	streamType,
	localStream,
	logger,
}: FiresideProducerKit) {
	if (!localStream.value) {
		logger.info('No local stream to start streaming with. Skipping.');
		return;
	}

	let bitrate = 5_000;
	let codec: OvenLiveKitCodec = 'H264';
	const parts = window.location.search.replace('?', '').split('&');

	for (const part of parts) {
		const [key, value] = part.split('=');
		if (!key || !value) {
			continue;
		}

		if (key === 'bitrate') {
			bitrate = parseInt(value) || bitrate;
			logger.info(`Override bitrate: ${bitrate}`);
		} else if (key === 'codec' && ['VP8', 'H264'].includes(value)) {
			codec = value as OvenLiveKitCodec;
			logger.info(`Override codec: ${codec}`);
		}
	}

	const [connectionUrl, connectionConfig] =
		streamType === 'video'
			? [
					`wss://stream-origin-01.development.gamejolt.com:3334/video/${host.userId}?direction=send&transport=tcp`,
					{
						// iceServers: null,
						// iceTransportPolicy: null,
						maxVideoBitrate: bitrate,
						preferredVideoFormat: codec,
					},
			  ]
			: [
					`wss://stream-origin-01.development.gamejolt.com:3334/chat/${host.userId}?direction=send&transport=tcp`,
					{
						// iceServers: null,
						// iceTransportPolicy: null,
					},
			  ];

	ovenClient.startStreaming(connectionUrl, connectionConfig);
}

export function stopKitStreaming({ ovenClient }: FiresideProducerKit) {
	ovenClient.stopStreaming();
}
