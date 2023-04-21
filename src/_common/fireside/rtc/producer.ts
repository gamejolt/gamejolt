import { computed, markRaw, ref, shallowRef } from 'vue';
import { trackFiresideStopStreaming } from '../../analytics/analytics.service';
import { Api } from '../../api/api.service';
import type { ASGController } from '../../client/asg/asg';
import { startDesktopAudioCapture } from '../../client/safe-exports';
import { showErrorGrowl } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import { $gettext } from '../../translate/translate.service';
import { MediaDeviceService } from '../media-device.service';
import {
	createFiresideRTCProducerKit,
	destroyFiresideRTCProducerKit,
	setKitMediaStream,
	startKitStreaming,
	stopKitStreaming,
} from './producer-kit';
import { FiresideRTC, applyRTCTokens, chooseFocusedRTCUser } from './rtc';
import {
	createLocalFiresideRTCUser,
	setUserHasDesktopAudio,
	setUserHasMicAudio,
	setUserHasVideo,
} from './user';

const RENEW_TOKEN_INTERVAL = 60_000;

export const PRODUCER_UNSET_DEVICE = 'unset';
export const PRODUCER_DEFAULT_GROUP_AUDIO = 'default';
export const PRODUCER_DESKTOP_VIDEO_DEVICE_ID = 'GJ_DESKTOP_VIDEO_CAPTURE';

type DeviceType = 'mic' | 'speakers' | 'video' | 'desktopAudio';
export type ProducerResetDeviceCallback = (type: DeviceType) => any;

function _parseInt(value: string, defaultValue: number) {
	const intValue = parseInt(value);
	return !intValue || isNaN(intValue) ? defaultValue : intValue;
}

export type FiresideRTCProducer = ReturnType<typeof createFiresideRTCProducer>;

export function createFiresideRTCProducer(rtc: FiresideRTC) {
	rtc.log('Trace(createFiresideRTCProducer)');

	// The target device IDs we want to be streaming with.
	const selectedWebcamDeviceId = ref('');
	const selectedMicDeviceId = ref('');
	const selectedDesktopAudioDeviceId = ref('');
	const selectedGroupAudioDeviceId = ref('');

	const shouldStreamDesktopAudio = ref(false);

	// The device IDs we are streaming with.
	const streamingWebcamDeviceId = ref<string | null>(null);
	const streamingMicDeviceId = ref<string | null>(null);
	const streamingDesktopAudioDeviceId = ref<string | null>(null);
	const streamingChatPlaybackDeviceId = ref<string | null>(null);
	const streamingASG = shallowRef<ASGController | null>(null);

	const isStreaming = ref(false);

	const isBusy = ref(false);
	const _busyPromise = shallowRef<Promise<any>>(Promise.resolve());

	const _tokenRenewInterval = shallowRef<NodeJS.Timer | null>(null);
	const _areTokensRenewing = ref(false);

	const canStreamVideo = computed(() => rtc.role?.can_stream_video === true);
	const canStreamAudio = computed(() => rtc.role?.can_stream_audio === true);

	const localVideoKit = shallowRef(createFiresideRTCProducerKit(rtc, 'video'));
	const localChatKit = shallowRef(createFiresideRTCProducerKit(rtc, 'chat'));

	/**
	 * Indicates that our mic isn't actually broadcasting, and is only displayed
	 * locally.
	 */
	const micMuted = ref(false);

	/**
	 * Indicates that our video isn't actually broadcasting, and is only
	 * displayed locally.
	 *
	 * Indicates for desktop audio as well.
	 */
	const videoMuted = ref(false);

	const hasWebcamDevice = computed(
		() =>
			selectedWebcamDeviceId.value !== '' &&
			selectedWebcamDeviceId.value !== PRODUCER_UNSET_DEVICE
	);

	const hasMicDevice = computed(
		() =>
			selectedMicDeviceId.value !== '' && selectedMicDeviceId.value !== PRODUCER_UNSET_DEVICE
	);

	const hasDesktopAudioDevice = computed(
		() =>
			selectedDesktopAudioDeviceId.value !== '' &&
			selectedDesktopAudioDeviceId.value !== PRODUCER_UNSET_DEVICE
	);

	let _resetDeviceCallback: ProducerResetDeviceCallback | null = null;

	function setResetDeviceCallback(cb: ProducerResetDeviceCallback | null) {
		_resetDeviceCallback = cb;
	}

	MediaDeviceService.detectDevices({ prompt: false });

	const producer = {
		rtc,
		selectedWebcamDeviceId,
		selectedMicDeviceId,
		selectedDesktopAudioDeviceId,
		selectedGroupAudioDeviceId,
		shouldStreamDesktopAudio,
		streamingWebcamDeviceId,
		streamingMicDeviceId,
		streamingDesktopAudioDeviceId,
		streamingChatPlaybackDeviceId,
		streamingASG,
		isStreaming,
		isBusy,
		canStreamVideo,
		canStreamAudio,
		hasWebcamDevice,
		hasMicDevice,
		hasDesktopAudioDevice,
		localVideoKit,
		localChatKit,

		setResetDeviceCallback,
		_resetDeviceCallback: computed(() => _resetDeviceCallback),

		micMuted,
		videoMuted,

		_busyPromise,
		_tokenRenewInterval,
		_areTokensRenewing,
	};

	_tokenRenewInterval.value = setInterval(() => _renewTokens(producer), RENEW_TOKEN_INTERVAL);

	return producer;
}

/**
 * Cleans up watchers and intervals that may be used by the producer. This does
 * NOT stop streaming or close channels. It's meant to be used to cleanup the
 * producer instance after we no longer need it.
 */
export function cleanupFiresideRTCProducer({
	isStreaming,
	_tokenRenewInterval,
	streamingASG,
	rtc,
	localVideoKit,
	localChatKit,
}: FiresideRTCProducer) {
	console.log('[FIRESIDE-RTC] Trace(cleanupFiresideRTCProducer)');

	// TODO(big-pp-event) theres nothing to prevent a queued up startStream
	// to get executed after cleanup is called on the same instance.
	isStreaming.value = false;

	if (_tokenRenewInterval.value) {
		clearInterval(_tokenRenewInterval.value);
		_tokenRenewInterval.value = null;
	}

	// If we were streaming desktop audio, make sure it's closed, since Agora
	// isn't gonna call this for us.
	if (streamingASG.value) {
		// TODO(oven): we might not have to do this if we are able to call the
		// onStreamClose callback during producer kit destruction.
		rtc.log(`Force stopping desktop audio streaming through ASG.`);
		streamingASG.value.stop();
		streamingASG.value = null;
	}

	destroyFiresideRTCProducerKit(localChatKit.value);
	destroyFiresideRTCProducerKit(localVideoKit.value);
}

async function _renewTokens(producer: FiresideRTCProducer) {
	const {
		_areTokensRenewing,
		isStreaming,
		rtc,
		rtc: { fireside, generation },
	} = producer;

	if (_areTokensRenewing.value) {
		return;
	}

	_areTokensRenewing.value = true;

	async function _updateHostTokens() {
		rtc.log(`Renewing streaming tokens.`);

		const response = await Api.sendRequest(
			'/web/dash/fireside/generate-streaming-tokens/' + fireside.id,
			{ streaming_uid: rtc.streamingUid },
			{ detach: true }
		);

		if (response?.success !== true) {
			throw new Error(response);
		}

		// Don't error out, but don't renew either.
		if (generation.isCanceled) {
			return;
		}

		const { videoToken, chatToken } = response;
		await applyRTCTokens(rtc, videoToken, chatToken);
	}

	async function _updateAudienceTokens() {
		// We only do this if we're currently streaming.
		if (!isStreaming.value) {
			return;
		}

		rtc.log(`Renewing audience tokens.`);

		const response = await updateSetIsStreaming(producer);

		if (response?.success !== true) {
			throw new Error(response);
		}

		return response;
	}

	try {
		await Promise.all([_updateHostTokens(), _updateAudienceTokens()]);
	} catch (e) {
		rtc.logWarning(`Got error while renewing tokens.`, e);
	} finally {
		_areTokensRenewing.value = false;
	}
}

/**
 * Sets the muted state for a specific broadcasting channel. Toggles if [mute]
 * is undefined.
 */
export function setProducerDeviceMuted(
	producer: FiresideRTCProducer,
	deviceType: 'video' | 'mic' | 'desktopAudio',
	mute?: boolean
) {
	// const localUser = producer.rtc.localUser;
	// if (!localUser) {
	// 	return;
	// }
	// let shouldMute = mute;
	// let channel: FiresideRTCChannel | null = null;
	// if (deviceType === 'mic') {
	// 	channel = localUser.rtc.chatChannel;
	// 	shouldMute ??= !producer.micMuted.value;
	// } else {
	// 	channel = localUser.rtc.videoChannel;
	// 	shouldMute ??= !producer.videoMuted.value;
	// }
	// if (!channel || shouldMute === undefined) {
	// 	return;
	// }
	// return _doBusyWork(producer, async () => {
	// 	const mute = shouldMute!;
	// 	if (!channel) {
	// 		return;
	// 	}
	// 	const client = channel.agoraClient;
	// 	const video = channel._localVideoTrack || undefined;
	// 	const audio = channel._localAudioTrack || undefined;
	// 	const tracks: (ILocalVideoTrack | ILocalAudioTrack)[] = [];
	// 	if (video) {
	// 		tracks.push(video);
	// 	}
	// 	if (audio) {
	// 		tracks.push(audio);
	// 	}
	// 	if (deviceType === 'mic') {
	// 		producer.micMuted.value = mute;
	// 	} else {
	// 		producer.videoMuted.value = mute;
	// 	}
	// 	return mute ? client.unpublish(tracks) : client.publish(tracks);
	// });
}

// Does some work serially.
function _doBusyWork<T>(producer: FiresideRTCProducer, work: () => Promise<T>) {
	const { _busyPromise, isBusy } = producer;

	const p = (async () => {
		// Wait for any previous work to finish first.
		await _busyPromise.value;

		isBusy.value = true;
		try {
			const ret = await work();

			// Sync any changes to our local user in the RTC after any work was
			// done.
			_syncLocalUserToRTC(producer);

			return ret;
		} catch (e) {
			console.error(e);
		} finally {
			isBusy.value = false;
		}
	})();

	_busyPromise.value = p;
	return p;
}

export function setSelectedWebcamDeviceId(producer: FiresideRTCProducer, deviceId: string) {
	const { selectedWebcamDeviceId } = producer;
	if (deviceId === selectedWebcamDeviceId.value) {
		return;
	}

	selectedWebcamDeviceId.value = deviceId;
	_updateVideoStream(producer);
}

export function setSelectedDesktopAudioStreaming(
	producer: FiresideRTCProducer,
	{ shouldStream, deviceId }: { shouldStream: boolean; deviceId: string }
) {
	const { shouldStreamDesktopAudio, selectedDesktopAudioDeviceId } = producer;
	if (
		shouldStream === shouldStreamDesktopAudio.value &&
		deviceId === selectedDesktopAudioDeviceId.value
	) {
		return;
	}

	shouldStreamDesktopAudio.value = shouldStream;
	selectedDesktopAudioDeviceId.value = deviceId;
	_updateVideoStream(producer);
}

/**
 * Will update our video stream to match the current state of the producer. It
 * attaches to the video device and the desktop audio device if selected.
 */
function _updateVideoStream(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedWebcamDeviceId,
			streamingWebcamDeviceId,
			hasWebcamDevice,
			hasDesktopAudioDevice,
			selectedDesktopAudioDeviceId,
			streamingDesktopAudioDeviceId,
			streamingASG,
			localVideoKit,
			rtc,
		} = producer;
		const { webcams, mics } = MediaDeviceService;

		let videoDeviceId: string | null = null;
		if (hasWebcamDevice.value) {
			const deviceExists = !!webcams.value.find(
				i => i.deviceId === selectedWebcamDeviceId.value
			);
			videoDeviceId = deviceExists ? selectedWebcamDeviceId.value : null;
		}

		let desktopAudioDeviceId: string | null = null;
		if (hasDesktopAudioDevice.value) {
			const deviceExists = !!mics.value.find(
				i => i.deviceId === selectedDesktopAudioDeviceId.value
			);
			desktopAudioDeviceId = deviceExists ? selectedDesktopAudioDeviceId.value : null;
		}

		// Freeze the state we want to be in.
		const shouldStreamDesktopAudio = producer.shouldStreamDesktopAudio.value;

		if (
			videoDeviceId === streamingWebcamDeviceId.value &&
			shouldStreamDesktopAudio === !!streamingASG.value &&
			desktopAudioDeviceId === streamingDesktopAudioDeviceId.value
		) {
			rtc.log(`Video/desktop audio already set up, skipping.`);
			return;
		}

		rtc.log(
			`Setting video/desktop audio devices.`,
			videoDeviceId,
			shouldStreamDesktopAudio,
			desktopAudioDeviceId
		);

		await setKitMediaStream(localVideoKit.value, {
			async streamBuilder() {
				// If we no longer need, then short circuit. We nee at least a
				// video in order to stream any of this.
				if (!videoDeviceId) {
					return null;
				}

				let width = 1280;
				let height = 720;
				let fps = 30;
				const parts = window.location.search.replace('?', '').split('&');

				for (const part of parts) {
					const [key, value] = part.split('=');
					if (!key || !value) {
						continue;
					}

					if (key === 'width') {
						width = _parseInt(value, width);
						rtc.log(`Override width: ${width}`);
					} else if (key === 'height') {
						height = _parseInt(value, height);
						rtc.log(`Override height: ${height}`);
					} else if (key === 'fps') {
						fps = _parseInt(value, fps);
						rtc.log(`Override fps: ${fps}`);
					}
				}

				try {
					const { ovenClient } = localVideoKit.value;

					let stream: MediaStream | null = null;
					const isScreenSharing = videoDeviceId === PRODUCER_DESKTOP_VIDEO_DEVICE_ID;

					// We first try to get their user media. This would be
					// either their webcam or a mic device for their desktop
					// audio. If they're screensharing without desktop audio,
					// this won't run.
					if (!isScreenSharing || desktopAudioDeviceId) {
						stream = await ovenClient.getUserMedia({
							video: !isScreenSharing
								? {
										width: { max: width, ideal: width },
										height: { max: height, ideal: height },
										frameRate: { max: fps },
										deviceId: {
											exact: videoDeviceId,
										},
								  }
								: false,
							audio: desktopAudioDeviceId
								? {
										// We disable all of this since we don't
										// want the desktop audio getting distorted.
										// We want it to go through unprocessed.
										autoGainControl: false,
										echoCancellation: false,
										noiseSuppression: false,
										deviceId: {
											exact: desktopAudioDeviceId,
										},
								  }
								: false,
						});
					}

					// If they've decided to screenshare, we need to pull it
					// through getDisplayMedia.
					if (isScreenSharing) {
						const desktopVideoStream = await ovenClient.getDisplayMedia({
							video: {
								width: { max: width, ideal: width },
								height: { max: height, ideal: height },
								frameRate: { max: fps, ideal: fps },
							},
						});

						if (!stream) {
							// This would mean that they don't have desktop
							// audio, so we can just use this stream directly.
							stream = desktopVideoStream;
						} else {
							// If they already have a stream, just add this
							// video track into it. The stream we're adding in
							// to will only have an audio track.
							for (const track of desktopVideoStream.getVideoTracks()) {
								stream.addTrack(track);
							}
						}
					}

					// This should never happen with the above logic.
					if (!stream) {
						throw new Error(`No stream was created.`);
					}

					// In this case they don't have a device ID for their
					// desktop audio and instead just want ASG to pull their
					// desktop audio.
					if (shouldStreamDesktopAudio) {
						rtc.log(`Creating desktop audio track from ASG.`);

						const generator = new MediaStreamTrackGenerator({ kind: 'audio' });
						streamingASG.value = await startDesktopAudioCapture(generator.writable);

						// TODO(oven): test this
						stream.addTrack(generator);
					}

					rtc.log('Got oven stream', stream);

					return stream;
				} catch (e) {
					const clearSelection = producer._resetDeviceCallback.value;

					if (videoDeviceId && clearSelection) {
						clearSelection('video');
					}

					if (desktopAudioDeviceId && clearSelection) {
						clearSelection('desktopAudio');
					}

					throw e;
				}
			},
			async onStreamClose() {
				// We only have cleanup to do if we're streaming with ASG.
				if (!streamingASG.value) {
					return;
				}

				rtc.log(`Stop streaming desktop audio through ASG.`);

				await streamingASG.value.stop();
				streamingASG.value = null;

				rtc.log(`Stopped streaming desktop audio ASG.`);
			},
		});

		streamingWebcamDeviceId.value = videoDeviceId;
		streamingDesktopAudioDeviceId.value = desktopAudioDeviceId;

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);
	});
}

export function setSelectedMicDeviceId(producer: FiresideRTCProducer, newMicId: string) {
	const { selectedMicDeviceId } = producer;
	if (newMicId === selectedMicDeviceId.value) {
		return;
	}

	selectedMicDeviceId.value = newMicId;
	_updateChatStream(producer);
}

/**
 * Will update our chat audio stream to match the current state of the producer. It
 * attaches to the mic device that is currently selected.
 */
function _updateChatStream(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const { hasMicDevice, selectedMicDeviceId, streamingMicDeviceId, localChatKit, rtc } =
			producer;
		const { mics } = MediaDeviceService;

		let deviceId: string | null = null;
		if (hasMicDevice.value) {
			const deviceExists = !!mics.value.find(i => i.deviceId === selectedMicDeviceId.value);
			deviceId = deviceExists ? selectedMicDeviceId.value : null;
		}

		if (deviceId === streamingMicDeviceId.value) {
			rtc.log(`Mic device is already set to ${deviceId}, skipping.`);
			return;
		}

		rtc.log(`Setting mic device to ${deviceId}`);

		await setKitMediaStream(localChatKit.value, {
			async streamBuilder() {
				if (!deviceId) {
					return null;
				}

				try {
					const { ovenClient } = localChatKit.value;
					const stream = await ovenClient.getUserMedia({
						audio: {
							autoGainControl: true,
							echoCancellation: true,
							noiseSuppression: true,
							deviceId: {
								exact: deviceId,
							},
						},
						video: false,
					});
					rtc.log('Got oven stream', stream);

					return stream;
				} catch (e) {
					const clearSelection = producer._resetDeviceCallback.value;
					if (deviceId && clearSelection) {
						clearSelection('mic');
					}

					throw e;
				}
			},
		});

		streamingMicDeviceId.value = deviceId;

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);
	});
}

export function setSelectedGroupAudioDeviceId(producer: FiresideRTCProducer, newSpeakerId: string) {
	const { selectedGroupAudioDeviceId } = producer;
	if (newSpeakerId === selectedGroupAudioDeviceId.value) {
		return;
	}

	selectedGroupAudioDeviceId.value = newSpeakerId;
	_updateGroupAudioTrack(producer);
}

function _updateGroupAudioTrack(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const { selectedGroupAudioDeviceId, streamingChatPlaybackDeviceId, rtc } = producer;
		const { speakers } = MediaDeviceService;

		const deviceExists = !!speakers.value.find(
			i => i.deviceId === selectedGroupAudioDeviceId.value
		);
		const deviceId = deviceExists
			? selectedGroupAudioDeviceId.value
			: PRODUCER_DEFAULT_GROUP_AUDIO;

		if (deviceId === streamingChatPlaybackDeviceId.value) {
			rtc.log(`Mic device is already set to ${deviceId}, skipping.`);
			return;
		}

		rtc.log(`Setting speaker device to ${deviceId}`);
		rtc.log(`Applying new audio playback device to all remote audio streams.`);

		try {
			// TODO(oven): make the vue component?
			// for (const user of rtc._allStreamingUsers) {
			// 	if (user._videoPlayer) {
			// 		user._videoPlayer.getMediaElement().setSinkId(deviceId);
			// 	}
			// }

			// if (rtc.localUser) {
			// 	// Local user isn't stored in the agora client remote users, so we
			// 	// need to set their devices seperately.
			// 	const { _micAudioTrack, _desktopAudioTrack } = rtc.localUser;

			// 	if (_micAudioTrack) {
			// 		await updateTrackPlaybackDevice(producer, _micAudioTrack);
			// 	}
			// 	if (_desktopAudioTrack) {
			// 		await updateTrackPlaybackDevice(producer, _desktopAudioTrack);
			// 	}
			// }

			// await Promise.all([
			// 	chatChannel.agoraClient.remoteUsers.map(remoteUser => {
			// 		const audioTrack = remoteUser.audioTrack;
			// 		if (!audioTrack) {
			// 			rtc.log(`- no microphone track for user ${remoteUser.uid}`);
			// 			return;
			// 		}

			// 		return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			// 	}),
			// 	videoChannel.agoraClient.remoteUsers.map(remoteUser => {
			// 		const audioTrack = remoteUser.audioTrack;
			// 		if (!audioTrack) {
			// 			rtc.log(`- no desktop audio track for user ${remoteUser.uid}`);
			// 			return;
			// 		}

			// 		return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			// 	}),
			// ]);

			streamingChatPlaybackDeviceId.value = deviceId;
		} catch (e) {
			const clearDevice = producer._resetDeviceCallback.value;
			if (deviceId && clearDevice) {
				clearDevice('speakers');
			}

			throw e;
		}
	});
}

// TODO(oven)
// function _updateRemoteUserPlaybackDevice(
// 	producer: FiresideRTCProducer,
// 	remoteUser: IAgoraRTCRemoteUser
// ) {
// 	const { rtc, streamingChatPlaybackDeviceId } = producer;

// 	const audioTrack = remoteUser.audioTrack;
// 	if (!audioTrack) {
// 		rtc.log(`- no audio track for user ${remoteUser.uid}`);
// 		return;
// 	}

// 	if (streamingChatPlaybackDeviceId.value !== null) {
// 		rtc.log(`- applying new audio track for user ${remoteUser.uid}`);
// 		return updateTrackPlaybackDevice(producer, audioTrack);
// 	}
// }

/**
 * This should be called anytime a new track is joined, or if the playback
 * device is updated.
 */
// export async function updateTrackPlaybackDevice(
// 	producer: FiresideRTCProducer,
// 	track: ILocalAudioTrack | IRemoteAudioTrack
// ) {
// 	const { streamingChatPlaybackDeviceId: deviceId } = producer;
// 	if (deviceId.value !== null) {
// 		try {
// 			// This will throw an error if they're not on Chrome.
// 			return track.setPlaybackDevice(deviceId.value);
// 		} catch (e) {
// 			console.error(`Got an error updating track playback device`, e);
// 		}
// 	}
// }

export function clearSelectedRecordingDevices(producer: FiresideRTCProducer) {
	setSelectedWebcamDeviceId(producer, PRODUCER_UNSET_DEVICE);
	setSelectedMicDeviceId(producer, PRODUCER_UNSET_DEVICE);
	setSelectedDesktopAudioStreaming(producer, {
		shouldStream: false,
		deviceId: PRODUCER_UNSET_DEVICE,
	});
}

export interface SetIsStreamingOptions {
	isStreaming?: boolean;
}

export async function updateSetIsStreaming(
	producer: FiresideRTCProducer,
	options?: SetIsStreamingOptions
) {
	const {
		rtc,
		selectedWebcamDeviceId,
		selectedMicDeviceId,
		shouldStreamDesktopAudio,
		selectedDesktopAudioDeviceId,
	} = producer;

	// We want to be able to bypass the producer's _isStreaming setting
	// because during cleanup we may call this before the producer has actually
	// disposed of their streams and we don't want to wait on that.
	const isStreaming = options?.isStreaming ?? producer.isStreaming.value;

	let response: any = null;
	let body: any = {};

	try {
		// TODO(oven): can we go based on just the selected IDs? do we have to look at the streams?
		body = {
			is_streaming: isStreaming,
			streaming_uid: rtc.streamingUid,
			has_video: selectedWebcamDeviceId.value !== PRODUCER_UNSET_DEVICE,
			// && rtc.videoChannel._localVideoTrack !== null,
			has_mic_audio: selectedMicDeviceId.value !== PRODUCER_UNSET_DEVICE,
			// && rtc.chatChannel._localAudioTrack !== null,
			has_desktop_audio:
				shouldStreamDesktopAudio.value ||
				selectedDesktopAudioDeviceId.value !== PRODUCER_UNSET_DEVICE,
			// && rtc.videoChannel._localAudioTrack !== null,
		};

		response = await Api.sendRequest(
			'/web/dash/fireside/set-is-streaming/' + rtc.fireside.id,
			body,
			{ detach: true }
		);
	} catch (e) {
		rtc.logWarning(`Got error while trying to set what we're streaming.`, e, body);
	}

	return response;
}

export function getOwnDesktopAudioVolume({
	localVideoKit,
	rtc: { generation },
}: FiresideRTCProducer) {
	if (generation.isCanceled) {
		return 0;
	}

	return localVideoKit.value.volumeMonitor.value?.getVolume() || 0;
}

export function getOwnMicAudioVolume({ localChatKit, rtc: { generation } }: FiresideRTCProducer) {
	if (generation.isCanceled) {
		return 0;
	}

	return localChatKit.value.volumeMonitor.value?.getVolume() || 0;
}

export async function startStreaming(producer: FiresideRTCProducer) {
	await _doBusyWork(producer, async () => {
		const {
			isStreaming,
			rtc,
			rtc: { generation },
			localVideoKit,
			localChatKit,
		} = producer;

		if (isStreaming.value) {
			return;
		}
		isStreaming.value = true;

		const response = await updateSetIsStreaming(producer);

		if (response?.success !== true || generation.isCanceled) {
			rtc.logWarning(`Couldn't start streaming.`, response);

			showErrorGrowl(
				$gettext(
					`Couldn't start streaming. Either fireside has ended, your permissions to stream have been revoked or you have a running stream elsewhere.`
				)
			);
			isStreaming.value = false;
			return;
		}

		try {
			startKitStreaming(localVideoKit.value);
			startKitStreaming(localChatKit.value);

			rtc.log(`Started streaming.`);
		} catch (err) {
			rtc.logError(err);
			showErrorGrowl($gettext('Could not start streaming. Try again later.'));
			await _stopStreaming(producer, false);
		}
	});
}

export function stopStreaming(producer: FiresideRTCProducer, logData: string) {
	trackFiresideStopStreaming(logData);
	return _stopStreaming(producer, true);
}

async function _stopStreaming(producer: FiresideRTCProducer, becomeBusy: boolean) {
	const busyWork = async () => {
		const { isStreaming, micMuted, videoMuted, rtc, localVideoKit, localChatKit } = producer;

		if (!isStreaming.value) {
			return;
		}
		isStreaming.value = false;

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		// Failure here should end up forcing the app to reload to make
		// absolutely sure they aren't streaming by accident.
		try {
			stopKitStreaming(localVideoKit.value);
			stopKitStreaming(localChatKit.value);

			// TODO(big-pp-event) I don't fully understand what this is supposed
			// to do and why we want to call this after the streams are stopped.
			// It looks like this unsets the recording devices which indirectly
			// stops the stream anyways?
			clearSelectedRecordingDevices(producer);
			micMuted.value = false;
			videoMuted.value = false;
		} catch (err) {
			rtc.logError(`Failed to stop one or more agora channels. Force reloading...`, err);
			Navigate.reload();
			return;
		}

		rtc.log(`Stopped streaming.`);
	};

	await (becomeBusy ? _doBusyWork(producer, busyWork) : busyWork());
}

/**
 * While we're streaming, anytime our local tracks change, we want to sync a
 * fake [FiresideRTCUser] to show us as part of the fireside.
 */
function _syncLocalUserToRTC(producer: FiresideRTCProducer) {
	// TODO(oven)
	// return;

	const {
		isStreaming,
		rtc,
		rtc: { userId },
		localVideoKit,
		localChatKit,
	} = producer;

	rtc.log(`Syncing the host user's tracks into RTC.`);
	let user = rtc.localUser;
	const hadUser = !!user;

	if (!isStreaming.value) {
		if (user) {
			rtc.log(`Destroying local RTC user since we're no longer streaming.`);

			setUserHasVideo(user, false);
			setUserHasDesktopAudio(user, false);
			setUserHasMicAudio(user, false);

			rtc.localUser = null;

			if (rtc.focusedUser === user) {
				rtc.focusedUser = null;
				chooseFocusedRTCUser(rtc);
			}

			rtc.log(`Destroyed local RTC user.`);
		}

		rtc.log(`Not streaming, nothing to sync.`);
		return;
	}

	const hadVideo = user?.hasVideo === true;
	const hadDesktopAudio = user?.hasDesktopAudio === true;
	const hadMicAudio = user?.hasMicAudio === true;

	const videoStream = localVideoKit.value.localStream.value;
	const chatStream = localChatKit.value.localStream.value;

	// Upsert the user's local streams.
	user ??= createLocalFiresideRTCUser(rtc, userId!);
	user._videoMediaStream = videoStream ? markRaw(videoStream) : null;
	user._chatMediaStream = chatStream ? markRaw(chatStream) : null;

	const hasVideo = Boolean(videoStream && videoStream.getVideoTracks().length > 0);
	const hasDesktopAudio = Boolean(videoStream && videoStream.getAudioTracks().length > 0);
	const hasMicAudio = Boolean(chatStream && chatStream.getAudioTracks().length > 0);

	if (hadVideo !== hasVideo) {
		setUserHasVideo(user, hasVideo);
		if (!hasVideo) {
			producer.videoMuted.value = false;
		}
	}
	if (hadDesktopAudio !== hasDesktopAudio) {
		setUserHasDesktopAudio(user, hasDesktopAudio);
	}
	if (hadMicAudio !== hasMicAudio) {
		setUserHasMicAudio(user, hasMicAudio);
		if (!hasMicAudio) {
			producer.micMuted.value = false;
		}
	}

	rtc.localUser = user;

	// If we just started streaming, choose us as the focused user.
	if (!hadUser) {
		rtc.focusedUser = user;
	}

	rtc.log(`Synced local user.`, {
		hasVideo,
		hasDesktopAudio,
		hasMicAudio,
		hadVideo,
		hadDesktopAudio,
		hadMicAudio,
	});
}
