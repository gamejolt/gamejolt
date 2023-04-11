import OvenLiveKitStatic from 'ovenlivekit';
import { markRaw, ref, shallowReadonly, shallowRef } from 'vue';
import { showErrorGrowl } from '../../growls/growls.service';
import { $gettext } from '../../translate/translate.service';
import { FiresideRTC } from './rtc';

// type OnTrackPublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
// type OnTrackUnpublish = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;

// // Everyone on ultra-low latency to try to mitigate the amount of delay between
// // chat audio and video.
// const DefaultAudienceLevel: AudienceLatencyLevelType = 2;

export type FiresideRTCProducerKit = ReturnType<typeof createFiresideRTCProducerKit>;

export function createFiresideRTCProducerKit(rtc: FiresideRTC) {
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
	const isConnected = ref(false);

	return shallowReadonly({
		rtc,
		ovenClient,
		localStream,
		isConnected,
	});
}

export async function setKitMediaStream(
	kit: FiresideRTCProducerKit,
	{
		streamBuilder,
		onStreamClose,
	}: {
		streamBuilder: () => Promise<MediaStream | null>;
		onStreamClose?: () => Promise<void>;
	}
) {
	const { ovenClient, rtc, localStream, isConnected } = kit;
	const generation = rtc.generation;

	if (localStream.value !== null) {
		rtc.log(`Local stream already exists.`);

		localStream.value = null;

		// TODO(oven)
		if (isConnected.value) {
			rtc.log(`Local stream is already published. Unpublishing first.`);
			ovenClient.stopStreaming();
			generation.assert();
		}

		// rtc.log(`Closing previous local video track.`);
		// localStream.value.close();

		await onStreamClose?.();
	}

	rtc.log(`Getting new stream.`);
	let newStream: MediaStream | null = null;
	try {
		newStream = await streamBuilder();
	} catch (e) {
		showErrorGrowl({
			message: $gettext(`Something went wrong trying to use that video device.`),
		});
		localStream.value = null;
		return;
	}
	localStream.value = newStream ? markRaw(newStream) : null;
	generation.assert();

	// TODO(oven)
	// // Only publish if we are streaming.
	// if (localStream.value !== null && channel._isPublished) {
	// 	rtc.log(`Publishing new video track.`);
	// 	await agoraClient.publish(localStream.value);
	// }

	generation.assert();
}
