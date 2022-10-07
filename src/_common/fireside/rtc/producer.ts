import type {
	IAgoraRTCRemoteUser,
	ILocalAudioTrack,
	ILocalVideoTrack,
	IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';
import { computed, markRaw, ref, shallowRef } from 'vue';
import { MediaDeviceService } from '../../agora/media-device.service';
import { Api } from '../../api/api.service';
import type { ASGController } from '../../client/asg/asg';
import { startDesktopAudioCapture } from '../../client/safe-exports';
import { importNoSSR } from '../../code-splitting';
import { showErrorGrowl } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import { $gettext, Translate } from '../../translate/translate.service';
import {
	FiresideRTCChannel,
	previewChannelVideo,
	setChannelAudioTrack,
	setChannelVideoTrack,
	startChannelStreaming,
	stopChannelStreaming,
} from './channel';
import { applyRTCTokens, chooseFocusedRTCUser, FiresideRTC } from './rtc';
import {
	createLocalFiresideRTCUser,
	setUserHasDesktopAudio,
	setUserHasMicAudio,
	setUserHasVideo,
} from './user';

const AgoraRTCLazy = importNoSSR(async () => (await import('agora-rtc-sdk-ng')).default);

const RENEW_TOKEN_INTERVAL = 60_000;

export const PRODUCER_UNSET_DEVICE = 'unset';
export const PRODUCER_DEFAULT_GROUP_AUDIO = 'default';

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

	const _videoPreviewElement = shallowRef<HTMLDivElement | null>(null);

	const isBusy = ref(false);
	const _busyPromise = shallowRef<Promise<any>>(Promise.resolve());

	const _tokenRenewInterval = shallowRef<NodeJS.Timer | null>(null);
	const _areTokensRenewing = ref(false);

	const canStreamVideo = computed(() => rtc.role?.can_stream_video === true);
	const canStreamAudio = computed(() => rtc.role?.can_stream_audio === true);

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

		micMuted,
		videoMuted,

		_videoPreviewElement,
		_busyPromise,
		_tokenRenewInterval,
		_areTokensRenewing,
	};

	_tokenRenewInterval.value = setInterval(() => _renewTokens(producer), RENEW_TOKEN_INTERVAL);

	return producer;
}

/**
 * Cleans up watchers and intervals that may be used by the producer.
 * This does NOT stop streaming or close channels. It's is meant to be used
 * to cleanup the producer instance after we no longer need it.
 */
export function cleanupFiresideRTCProducer({
	isStreaming,
	_tokenRenewInterval,
	streamingASG,
	rtc,
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
		rtc.log(`Force stopping desktop audio streaming through ASG.`);
		streamingASG.value.stop();
		streamingASG.value = null;
	}
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
	const localUser = producer.rtc.localUser;
	if (!localUser) {
		return;
	}

	let shouldMute = mute;
	let channel: FiresideRTCChannel | null = null;

	if (deviceType === 'mic') {
		channel = localUser.rtc.chatChannel;
		shouldMute ??= !producer.micMuted.value;
	} else {
		channel = localUser.rtc.videoChannel;
		shouldMute ??= !producer.videoMuted.value;
	}

	if (!channel || shouldMute === undefined) {
		return;
	}

	return _doBusyWork(producer, async () => {
		const mute = shouldMute!;
		if (!channel) {
			return;
		}

		const client = channel.agoraClient;
		const video = channel._localVideoTrack || undefined;
		const audio = channel._localAudioTrack || undefined;

		const tracks: (ILocalVideoTrack | ILocalAudioTrack)[] = [];
		if (video) {
			tracks.push(video);
		}
		if (audio) {
			tracks.push(audio);
		}

		if (deviceType === 'mic') {
			producer.micMuted.value = mute;
		} else {
			producer.videoMuted.value = mute;
		}

		return mute ? client.unpublish(tracks) : client.publish(tracks);
	});
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
		} finally {
			isBusy.value = false;
		}
	})();

	_busyPromise.value = p;
	return p;
}

export function setSelectedWebcamDeviceId(
	producer: FiresideRTCProducer,
	newWebcamDeviceId: string
) {
	const { selectedWebcamDeviceId } = producer;
	if (newWebcamDeviceId === selectedWebcamDeviceId.value) {
		return;
	}

	selectedWebcamDeviceId.value = newWebcamDeviceId;
	_updateWebcamTrack(producer);
}

function _updateWebcamTrack(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedWebcamDeviceId,
			streamingWebcamDeviceId,
			hasWebcamDevice,
			_videoPreviewElement,
			rtc,
			rtc: { videoChannel },
		} = producer;
		const { webcams } = MediaDeviceService;

		let deviceId: string | null = null;
		if (hasWebcamDevice.value) {
			const deviceExists = !!webcams.value.find(
				i => i.deviceId === selectedWebcamDeviceId.value
			);
			deviceId = deviceExists ? selectedWebcamDeviceId.value : null;
		}

		if (deviceId === streamingWebcamDeviceId.value) {
			rtc.log(`Video device is already set to ${deviceId}, skipping.`);
			return;
		}

		rtc.log(`Setting video device to ${deviceId}`);

		await setChannelVideoTrack(videoChannel, {
			async trackBuilder() {
				if (!deviceId) {
					return null;
				}

				let width = 1280;
				let height = 720;
				let fps = 30;
				let bitrate = 4_000;
				let mode = 'detail' as 'motion' | 'detail';
				const parts = window.location.search.replace('?', '').split('&');

				const _parseInt = (value: string, defaultValue: number) => {
					const intValue = parseInt(value);
					return !intValue || isNaN(intValue) ? defaultValue : intValue;
				};

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
					} else if (key === 'bitrate') {
						bitrate = _parseInt(value, bitrate);
						rtc.log(`Override bitrate: ${bitrate}`);
					} else if (key === 'mode' && (value === 'motion' || value === 'detail')) {
						mode = value;
						rtc.log(`Override mode: ${mode}`);
					}
				}

				const AgoraRTC = await AgoraRTCLazy;

				// Test code below.

				// nw.Screen.Init();

				// const track = await new Promise<ILocalVideoTrack>((resolve, reject) => {
				// 	nw.Screen.chooseDesktopMedia(['window', 'screen'], function (streamId) {
				// 		navigator.webkitGetUserMedia(
				// 			{
				// 				audio: false,
				// 				video: {
				// 					mandatory: {
				// 						chromeMediaSource: 'desktop',
				// 						chromeMediaSourceId: streamId,
				// 						maxWidth: 1920,
				// 						maxHeight: 1080,
				// 					},
				// 					optional: [],
				// 				},
				// 			},
				// 			(stream: MediaStream) => {
				// 				const track = AgoraRTC.createCustomVideoTrack({
				// 					optimizationMode: mode,
				// 					// encoderConfig: {
				// 					// 	bitrateMax: bitrate,
				// 					// 	width: { max: width, ideal: width },
				// 					// 	height: { max: height, ideal: height },
				// 					// 	frameRate: { max: fps },
				// 					// },
				// 					bitrateMax: bitrate,
				// 					mediaStreamTrack: stream.getVideoTracks()[0],
				// 				});

				// 				resolve(track);
				// 			},
				// 			() => {
				// 				console.error('nope');
				// 				reject();
				// 			}
				// 		);
				// 	});
				// });

				// const stream = await navigator.mediaDevices.getDisplayMedia({
				// 	audio: false,
				// 	video: {
				// 		width: { max: width, ideal: width },
				// 		height: { max: height, ideal: height },
				// 		frameRate: { max: fps, ideal: fps },
				// 	},
				// });

				// const track = AgoraRTC.createCustomVideoTrack({
				// 	optimizationMode: mode,
				// 	bitrateMax: bitrate,
				// 	mediaStreamTrack: stream.getVideoTracks()[0],
				// });

				const track = await AgoraRTC.createCameraVideoTrack({
					cameraId: deviceId,
					optimizationMode: mode,
					encoderConfig: {
						bitrateMax: bitrate,
						width: { max: width, ideal: width },
						height: { max: height, ideal: height },
						frameRate: { max: fps },
					},
				});

				rtc.log(`Video webcam track ID: ${track.getTrackId()}`);

				return track;
			},
		});

		streamingWebcamDeviceId.value = deviceId;

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		if (_videoPreviewElement.value) {
			previewChannelVideo(producer.rtc.localUser, videoChannel, _videoPreviewElement.value);
		}
	});
}

export function setSelectedMicDeviceId(producer: FiresideRTCProducer, newMicId: string) {
	const { selectedMicDeviceId } = producer;
	if (newMicId === selectedMicDeviceId.value) {
		return;
	}

	selectedMicDeviceId.value = newMicId;
	_updateMicTrack(producer);
}

function _updateMicTrack(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			hasMicDevice,
			selectedMicDeviceId,
			streamingMicDeviceId,
			rtc,
			rtc: { chatChannel },
		} = producer;
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

		await setChannelAudioTrack(chatChannel, {
			async trackBuilder() {
				if (!deviceId) {
					return null;
				}

				const AgoraRTC = await AgoraRTCLazy;
				const track = await AgoraRTC.createMicrophoneAudioTrack({
					microphoneId: deviceId,
				});
				track.setVolume(100);

				rtc.log(`Mic track ID: ${track.getTrackId()}`);

				return track;
			},
		});

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		streamingMicDeviceId.value = deviceId;
	});
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
	_updateDesktopAudioTrack(producer);
}

function _updateDesktopAudioTrack(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			hasDesktopAudioDevice,
			shouldStreamDesktopAudio,
			selectedDesktopAudioDeviceId,
			streamingDesktopAudioDeviceId,
			streamingASG,
			rtc,
			rtc: { videoChannel },
		} = producer;
		const { mics } = MediaDeviceService;

		let deviceId: string | null = null;
		if (hasDesktopAudioDevice.value) {
			const deviceExists = !!mics.value.find(
				i => i.deviceId === selectedDesktopAudioDeviceId.value
			);
			deviceId = deviceExists ? selectedDesktopAudioDeviceId.value : null;
		}

		// Freeze the state we want to be in.
		const shouldStream = shouldStreamDesktopAudio.value;

		if (
			shouldStream === !!streamingASG.value &&
			deviceId === streamingDesktopAudioDeviceId.value
		) {
			rtc.log(`Desktop audio already set up properly, skipping.`);
			return;
		}

		rtc.log(`Setting desktop audio device.`, {
			shouldStream,
			deviceId,
		});

		await setChannelAudioTrack(videoChannel, {
			async trackBuilder() {
				if (!shouldStream && !deviceId) {
					return null;
				}

				const AgoraRTC = await AgoraRTCLazy;
				let track: ILocalAudioTrack | undefined;

				// If a device was set for streaming, we want to use that
				// instead of using ASG.
				if (shouldStream) {
					rtc.log(`Creating desktop audio track from ASG.`);

					const generator = new MediaStreamTrackGenerator({ kind: 'audio' });
					streamingASG.value = await startDesktopAudioCapture(generator.writable);

					track = AgoraRTC.createCustomAudioTrack({
						mediaStreamTrack: generator,
						encoderConfig: 'high_quality_stereo',
					});
				} else if (deviceId) {
					rtc.log(`Creating desktop audio track from microphone source.`);

					track = await AgoraRTC.createMicrophoneAudioTrack({
						microphoneId: deviceId,
						// We disable all this so that it doesn't affect the desktop audio in any way.
						AEC: false,
						AGC: false,
						ANS: false,
						encoderConfig: 'high_quality_stereo',
					});
				} else {
					rtc.log(`Invalid state detected for desktop audio track.`);
					return null;
				}

				track.setVolume(100);

				rtc.log(`Desktop audio track ID: ${track.getTrackId()}`);

				return track;
			},
			async onTrackClose() {
				// Only need to close the track if we're streaming the desktop
				// audio with ASG.
				if (!streamingASG.value) {
					return;
				}

				rtc.log(`Stop streaming desktop audio through ASG.`);

				await streamingASG.value.stop();
				streamingASG.value = null;

				rtc.log(`Stopped streaming desktop audio ASG.`);
			},
		});

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		streamingDesktopAudioDeviceId.value = deviceId;
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
		const {
			selectedGroupAudioDeviceId,
			streamingChatPlaybackDeviceId,
			rtc,
			rtc: { chatChannel, videoChannel },
		} = producer;
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

		if (rtc.localUser) {
			// Local user isn't stored in the agora client remote users, so we
			// need to set their devices seperately.
			const { _micAudioTrack, _desktopAudioTrack } = rtc.localUser;

			if (_micAudioTrack) {
				await updateTrackPlaybackDevice(producer, _micAudioTrack);
			}
			if (_desktopAudioTrack) {
				await updateTrackPlaybackDevice(producer, _desktopAudioTrack);
			}
		}

		await Promise.all([
			chatChannel.agoraClient.remoteUsers.map(remoteUser => {
				const audioTrack = remoteUser.audioTrack;
				if (!audioTrack) {
					rtc.log(`- no microphone track for user ${remoteUser.uid}`);
					return;
				}

				return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			}),
			videoChannel.agoraClient.remoteUsers.map(remoteUser => {
				const audioTrack = remoteUser.audioTrack;
				if (!audioTrack) {
					rtc.log(`- no desktop audio track for user ${remoteUser.uid}`);
					return;
				}

				return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			}),
		]);

		streamingChatPlaybackDeviceId.value = deviceId;
	});
}

function _updateRemoteUserPlaybackDevice(
	producer: FiresideRTCProducer,
	remoteUser: IAgoraRTCRemoteUser
) {
	const { rtc, streamingChatPlaybackDeviceId } = producer;

	const audioTrack = remoteUser.audioTrack;
	if (!audioTrack) {
		rtc.log(`- no audio track for user ${remoteUser.uid}`);
		return;
	}

	if (streamingChatPlaybackDeviceId.value !== null) {
		rtc.log(`- applying new audio track for user ${remoteUser.uid}`);
		return updateTrackPlaybackDevice(producer, audioTrack);
	}
}

/**
 * This should be called anytime a new track is joined, or if the playback
 * device is updated.
 */
export async function updateTrackPlaybackDevice(
	producer: FiresideRTCProducer,
	track: ILocalAudioTrack | IRemoteAudioTrack
) {
	const { streamingChatPlaybackDeviceId: deviceId } = producer;
	if (deviceId.value !== null) {
		try {
			// This will throw an error if they're not on Chrome.
			return track.setPlaybackDevice(deviceId.value);
		} catch {}
	}
}

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
		body = {
			is_streaming: isStreaming,
			streaming_uid: rtc.streamingUid,
			has_video:
				selectedWebcamDeviceId.value !== PRODUCER_UNSET_DEVICE &&
				rtc.videoChannel._localVideoTrack !== null,
			has_mic_audio:
				selectedMicDeviceId.value !== PRODUCER_UNSET_DEVICE &&
				rtc.chatChannel._localAudioTrack !== null,
			has_desktop_audio:
				(shouldStreamDesktopAudio.value ||
					selectedDesktopAudioDeviceId.value !== PRODUCER_UNSET_DEVICE) &&
				rtc.videoChannel._localAudioTrack !== null,
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

export function setVideoPreviewElement(
	producer: FiresideRTCProducer,
	element: HTMLDivElement | null
) {
	const {
		_videoPreviewElement,
		rtc: { videoChannel },
	} = producer;

	if (_videoPreviewElement.value && _videoPreviewElement.value !== element) {
		_videoPreviewElement.value.innerHTML = '';
	}

	producer._videoPreviewElement.value = element;
	if (element) {
		previewChannelVideo(producer.rtc.localUser, videoChannel, element);
	}
}

export function getOwnDesktopAudioVolume({
	rtc: { videoChannel, generation },
}: FiresideRTCProducer) {
	if (generation.isCanceled) {
		return 0;
	}

	return videoChannel._localAudioTrack?.getVolumeLevel() || 0;
}

export function getOwnMicAudioVolume({ rtc: { chatChannel, generation } }: FiresideRTCProducer) {
	if (generation.isCanceled) {
		return 0;
	}

	return chatChannel._localAudioTrack?.getVolumeLevel() || 0;
}

export async function startStreaming(producer: FiresideRTCProducer) {
	await _doBusyWork(producer, async () => {
		const {
			isStreaming,
			rtc,
			rtc: { videoChannel, chatChannel, generation },
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
			await Promise.all([
				startChannelStreaming(videoChannel),
				startChannelStreaming(chatChannel),
			]);

			rtc.log(`Started streaming.`);
		} catch (err) {
			rtc.logError(err);
			showErrorGrowl(Translate.$gettext('Could not start streaming. Try again later.'));
			await _stopStreaming(producer, false);
		}
	});
}

export function stopStreaming(producer: FiresideRTCProducer) {
	return _stopStreaming(producer, true);
}

async function _stopStreaming(producer: FiresideRTCProducer, becomeBusy: boolean) {
	const busyWork = async () => {
		const {
			isStreaming,
			micMuted,
			videoMuted,
			rtc,
			rtc: { videoChannel, chatChannel },
		} = producer;

		if (!isStreaming.value) {
			return;
		}
		isStreaming.value = false;

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		// Failure here should end up forcing the app to reload to make
		// absolutely sure they aren't streaming by accident.
		try {
			await Promise.all([
				stopChannelStreaming(videoChannel),
				stopChannelStreaming(chatChannel),
			]);

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
	const {
		isStreaming,
		rtc,
		rtc: { streamingUid, videoChannel, chatChannel },
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

	user ??= createLocalFiresideRTCUser(rtc, streamingUid);
	user._videoTrack = videoChannel._localVideoTrack
		? markRaw(videoChannel._localVideoTrack)
		: null;
	user._desktopAudioTrack = videoChannel._localAudioTrack
		? markRaw(videoChannel._localAudioTrack)
		: null;
	user._micAudioTrack = chatChannel._localAudioTrack
		? markRaw(chatChannel._localAudioTrack)
		: null;

	const hasVideo = !!user._videoTrack;
	const hasDesktopAudio = !!user._desktopAudioTrack;
	const hasMicAudio = !!user._micAudioTrack;

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
		// It shouldn't be possible to not have a streaming UID by this point.
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
