import { ComputedRef, Ref, ShallowRef, computed, ref, shallowRef } from 'vue';
import { GridFiresideChannel } from '../../../app/components/grid/fireside-channel';
import { createLogger } from '../../../utils/logging';
import { trackFiresideStopStreaming } from '../../analytics/analytics.service';
import type { ASGController } from '../../client/asg/asg';
import { startDesktopAudioCapture } from '../../client/safe-exports';
import { showErrorGrowl } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import { $gettext } from '../../translate/translate.service';
import { Fireside } from '../fireside.model';
import { MediaDeviceService } from '../media-device.service';
import { FiresideHost } from './host';
import {
	createFiresideProducerKit,
	destroyFiresideProducerKit,
	setKitMediaStream,
	startKitStreaming,
	stopKitStreaming,
} from './producer-kit';

export const PRODUCER_UNSET_DEVICE = 'unset';
export const PRODUCER_DEFAULT_GROUP_AUDIO = 'default';
export const PRODUCER_DESKTOP_VIDEO_DEVICE_ID = 'GJ_DESKTOP_VIDEO_CAPTURE';

type DeviceType = 'mic' | 'speakers' | 'video' | 'desktopAudio';
export type ProducerResetDeviceCallback = (type: DeviceType) => any;

function _parseInt(value: string, defaultValue: number) {
	const intValue = parseInt(value);
	return !intValue || isNaN(intValue) ? defaultValue : intValue;
}

export type FiresideProducer = ReturnType<typeof createFiresideProducer>;

export function createFiresideProducer({
	fireside,
	gridChannel: _gridChannel,
	localHost,
}: {
	fireside: Fireside;
	gridChannel: ShallowRef<GridFiresideChannel | undefined>;
	localHost: ComputedRef<FiresideHost | null>;
}) {
	const logger = createLogger('Fireside Producer');

	logger.info('Creating producer.');

	/**
	 * The local {@link FiresideHost} if they're currently streaming.
	 */
	const localUser = ref(null) as Ref<FiresideHost | null>;

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

	const canStreamVideo = computed(() => fireside.role?.can_stream_video === true);
	const canStreamAudio = computed(() => fireside.role?.can_stream_audio === true);

	if (!localHost.value) {
		throw new Error(`Must have a local host to create a producer!`);
	}

	// We are purposefully freezing the local host on the kit since if it ever
	// changes we should tear down the whole producer instead.
	const localVideoKit = shallowRef(
		createFiresideProducerKit({ streamType: 'video', host: localHost.value })
	);
	const localChatKit = shallowRef(
		createFiresideProducerKit({ streamType: 'chat', host: localHost.value })
	);

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

	// These two are just for convenience.
	const videoStream = computed(() => localVideoKit.value.localStream.value);
	const chatStream = computed(() => localChatKit.value.localStream.value);

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
		logger,
		localUser,
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

		videoStream,
		chatStream,

		setResetDeviceCallback,
		_resetDeviceCallback: computed(() => _resetDeviceCallback),

		micMuted,
		videoMuted,

		_busyPromise,
		_tokenRenewInterval,
		_areTokensRenewing,

		// From the controller
		_gridChannel,
	};

	return producer;
}

/**
 * Cleans up watchers and intervals that may be used by the producer. This does
 * NOT stop streaming or close channels. It's meant to be used to cleanup the
 * producer instance after we no longer need it.
 */
export function destroyFiresideProducer({
	isStreaming,
	_tokenRenewInterval,
	streamingASG,
	localVideoKit,
	localChatKit,
	logger,
}: FiresideProducer) {
	logger.info('Destroying producer.');

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
		logger.info(`Force stopping desktop audio streaming through ASG.`);
		streamingASG.value.stop();
		streamingASG.value = null;
	}

	destroyFiresideProducerKit(localChatKit.value);
	destroyFiresideProducerKit(localVideoKit.value);
}

// async function _renewTokens(producer: FiresideRTCProducer) {
// 	const {
// 		_areTokensRenewing,
// 		isStreaming,
// 		rtc,
// 		rtc: { fireside, generation },
// 	} = producer;

// 	if (_areTokensRenewing.value) {
// 		return;
// 	}

// 	_areTokensRenewing.value = true;

// 	async function _updateHostTokens() {
// 		logger.info(`Renewing streaming tokens.`);

// 		const response = await Api.sendRequest(
// 			'/web/dash/fireside/generate-streaming-tokens/' + fireside.id,
// 			{ streaming_uid: rtc.streamingUid },
// 			{ detach: true }
// 		);

// 		if (response?.success !== true) {
// 			throw new Error(response);
// 		}

// 		// Don't error out, but don't renew either.
// 		if (generation.isCanceled) {
// 			return;
// 		}

// 		const { videoToken, chatToken } = response;
// 		await applyRTCTokens(rtc, videoToken, chatToken);
// 	}

// 	async function _updateAudienceTokens() {
// 		// We only do this if we're currently streaming.
// 		if (!isStreaming.value) {
// 			return;
// 		}

// 		logger.info(`Renewing audience tokens.`);

// 		const response = await updateSetIsStreaming(producer);

// 		if (response?.success !== true) {
// 			throw new Error(response);
// 		}

// 		return response;
// 	}

// 	try {
// 		await Promise.all([_updateHostTokens(), _updateAudienceTokens()]);
// 	} catch (e) {
// 		logger.infoWarning(`Got error while renewing tokens.`, e);
// 	} finally {
// 		_areTokensRenewing.value = false;
// 	}
// }

/**
 * Sets the muted state for a specific broadcasting channel. Toggles if [mute]
 * is undefined.
 */
export function setProducerDeviceMuted(
	producer: FiresideProducer,
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
function _doBusyWork<T>(
	{ _busyPromise, isBusy, logger }: FiresideProducer,
	work: () => Promise<T>
) {
	const p = (async () => {
		// Wait for any previous work to finish first.
		await _busyPromise.value;

		isBusy.value = true;
		try {
			const ret = await work();

			// Sync any changes to our local user in the RTC after any work was
			// done.
			// _syncLocalUserToRTC(producer);

			return ret;
		} catch (e) {
			logger.error(e);
		} finally {
			isBusy.value = false;
		}
	})();

	_busyPromise.value = p;
	return p;
}

export function setSelectedWebcamDeviceId(producer: FiresideProducer, deviceId: string) {
	const { selectedWebcamDeviceId } = producer;
	if (deviceId === selectedWebcamDeviceId.value) {
		return;
	}

	selectedWebcamDeviceId.value = deviceId;
	_updateVideoStream(producer);
}

export function setSelectedDesktopAudioStreaming(
	producer: FiresideProducer,
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
function _updateVideoStream(producer: FiresideProducer) {
	return _doBusyWork(producer, async () => {
		const {
			logger,
			selectedWebcamDeviceId,
			streamingWebcamDeviceId,
			hasWebcamDevice,
			hasDesktopAudioDevice,
			selectedDesktopAudioDeviceId,
			streamingDesktopAudioDeviceId,
			streamingASG,
			localVideoKit,
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
			logger.info(`Video/desktop audio already set up, skipping.`);
			return;
		}

		logger.info(
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
						logger.info(`Override width: ${width}`);
					} else if (key === 'height') {
						height = _parseInt(value, height);
						logger.info(`Override height: ${height}`);
					} else if (key === 'fps') {
						fps = _parseInt(value, fps);
						logger.info(`Override fps: ${fps}`);
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
						logger.info(`Creating desktop audio track from ASG.`);

						const generator = new MediaStreamTrackGenerator({ kind: 'audio' });
						streamingASG.value = await startDesktopAudioCapture(generator.writable);

						// TODO(oven): test this
						stream.addTrack(generator);
					}

					logger.info('Got oven stream', stream);

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

				logger.info(`Stop streaming desktop audio through ASG.`);

				await streamingASG.value.stop();
				streamingASG.value = null;

				logger.info(`Stopped streaming desktop audio ASG.`);
			},
		});

		streamingWebcamDeviceId.value = videoDeviceId;
		streamingDesktopAudioDeviceId.value = desktopAudioDeviceId;

		// TODO(oven): gotta update with grid and everything when devices change.
		// updateSetIsStreaming(producer);
	});
}

export function setSelectedMicDeviceId(producer: FiresideProducer, newMicId: string) {
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
function _updateChatStream(producer: FiresideProducer) {
	return _doBusyWork(producer, async () => {
		const { logger, hasMicDevice, selectedMicDeviceId, streamingMicDeviceId, localChatKit } =
			producer;
		const { mics } = MediaDeviceService;

		let deviceId: string | null = null;
		if (hasMicDevice.value) {
			const deviceExists = !!mics.value.find(i => i.deviceId === selectedMicDeviceId.value);
			deviceId = deviceExists ? selectedMicDeviceId.value : null;
		}

		if (deviceId === streamingMicDeviceId.value) {
			logger.info(`Mic device is already set to ${deviceId}, skipping.`);
			return;
		}

		logger.info(`Setting mic device to ${deviceId}`);

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
					logger.info('Got oven stream.', stream);

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

		// TODO(oven): gotta update with grid and everything when devices change.
		// updateSetIsStreaming(producer);
	});
}

export function setSelectedGroupAudioDeviceId(producer: FiresideProducer, newSpeakerId: string) {
	const { selectedGroupAudioDeviceId } = producer;
	if (newSpeakerId === selectedGroupAudioDeviceId.value) {
		return;
	}

	selectedGroupAudioDeviceId.value = newSpeakerId;
	_updateGroupAudioTrack(producer);
}

function _updateGroupAudioTrack(producer: FiresideProducer) {
	return _doBusyWork(producer, async () => {
		const { logger, selectedGroupAudioDeviceId, streamingChatPlaybackDeviceId } = producer;
		const { speakers } = MediaDeviceService;

		const deviceExists = !!speakers.value.find(
			i => i.deviceId === selectedGroupAudioDeviceId.value
		);
		const deviceId = deviceExists
			? selectedGroupAudioDeviceId.value
			: PRODUCER_DEFAULT_GROUP_AUDIO;

		if (deviceId === streamingChatPlaybackDeviceId.value) {
			logger.info(`Mic device is already set to ${deviceId}, skipping.`);
			return;
		}

		logger.info(`Setting speaker device to ${deviceId}`);
		logger.info(`Applying new audio playback device to all remote audio streams.`);

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
			// 			logger.info(`- no microphone track for user ${remoteUser.uid}`);
			// 			return;
			// 		}

			// 		return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			// 	}),
			// 	videoChannel.agoraClient.remoteUsers.map(remoteUser => {
			// 		const audioTrack = remoteUser.audioTrack;
			// 		if (!audioTrack) {
			// 			logger.info(`- no desktop audio track for user ${remoteUser.uid}`);
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
// 		logger.info(`- no audio track for user ${remoteUser.uid}`);
// 		return;
// 	}

// 	if (streamingChatPlaybackDeviceId.value !== null) {
// 		logger.info(`- applying new audio track for user ${remoteUser.uid}`);
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

export function clearSelectedRecordingDevices(producer: FiresideProducer) {
	setSelectedWebcamDeviceId(producer, PRODUCER_UNSET_DEVICE);
	setSelectedMicDeviceId(producer, PRODUCER_UNSET_DEVICE);
	setSelectedDesktopAudioStreaming(producer, {
		shouldStream: false,
		deviceId: PRODUCER_UNSET_DEVICE,
	});
}

// export interface SetIsStreamingOptions {
// 	isStreaming?: boolean;
// }

// export async function updateSetIsStreaming(
// 	producer: FiresideRTCProducer,
// 	options?: SetIsStreamingOptions
// ) {
// 	const {
// 		logger,
// 		selectedWebcamDeviceId,
// 		selectedMicDeviceId,
// 		shouldStreamDesktopAudio,
// 		selectedDesktopAudioDeviceId,
// 	} = producer;

// 	// We want to be able to bypass the producer's _isStreaming setting
// 	// because during cleanup we may call this before the producer has actually
// 	// disposed of their streams and we don't want to wait on that.
// 	const isStreaming = options?.isStreaming ?? producer.isStreaming.value;

// 	let response: any = null;
// 	let body: any = {};

// 	try {
// 		// TODO(oven): can we go based on just the selected IDs? do we have to look at the streams?
// 		body = {
// 			is_streaming: isStreaming,
// 			streaming_uid: rtc.streamingUid,
// 			has_video: selectedWebcamDeviceId.value !== PRODUCER_UNSET_DEVICE,
// 			// && rtc.videoChannel._localVideoTrack !== null,
// 			has_mic_audio: selectedMicDeviceId.value !== PRODUCER_UNSET_DEVICE,
// 			// && rtc.chatChannel._localAudioTrack !== null,
// 			has_desktop_audio:
// 				shouldStreamDesktopAudio.value ||
// 				selectedDesktopAudioDeviceId.value !== PRODUCER_UNSET_DEVICE,
// 			// && rtc.videoChannel._localAudioTrack !== null,
// 		};

// 		response = await Api.sendRequest(
// 			'/web/dash/fireside/set-is-streaming/' + rtc.fireside.id,
// 			body,
// 			{ detach: true }
// 		);
// 	} catch (e) {
// 		logger.warn(`Got error while trying to set what we're streaming.`, e, body);
// 	}

// 	return response;
// }

export function getOwnDesktopAudioVolume({ localVideoKit }: FiresideProducer) {
	return localVideoKit.value.volumeMonitor.value?.getVolume() || 0;
}

export function getOwnMicAudioVolume({ localChatKit }: FiresideProducer) {
	return localChatKit.value.volumeMonitor.value?.getVolume() || 0;
}

export async function startStreaming(producer: FiresideProducer) {
	await _doBusyWork(producer, async () => {
		const {
			isStreaming,
			localVideoKit,
			localChatKit,
			streamingWebcamDeviceId,
			streamingDesktopAudioDeviceId,
			streamingMicDeviceId,
			shouldStreamDesktopAudio,
			_gridChannel,
			logger,
		} = producer;

		// if (isStreaming.value) {
		// 	return;
		// }
		// isStreaming.value = true;

		// const response = await updateSetIsStreaming(producer);

		// if (response?.success !== true || generation.isCanceled) {
		// 	logger.infoWarning(`Couldn't start streaming.`, response);

		// 	showErrorGrowl(
		// 		$gettext(
		// 			`Couldn't start streaming. Either fireside has ended, your permissions to stream have been revoked or you have a running stream elsewhere.`
		// 		)
		// 	);
		// 	isStreaming.value = false;
		// 	return;
		// }

		if (!_gridChannel.value) {
			logger.error(`Can't start streaming without being connected to the grid.`);
			return;
		}

		try {
			isStreaming.value = true;

			startKitStreaming(localVideoKit.value);
			startKitStreaming(localChatKit.value);

			await _gridChannel.value.pushSetStream({
				is_streaming_video: streamingWebcamDeviceId.value !== null,
				is_streaming_audio_desktop:
					shouldStreamDesktopAudio.value || streamingDesktopAudioDeviceId.value !== null,
				is_streaming_audio_mic: streamingMicDeviceId.value !== null,
			});

			logger.info(`Started streaming.`);
		} catch (err) {
			logger.error(err);
			showErrorGrowl($gettext('Could not start streaming. Try again later.'));
			await _stopStreaming(producer, false);
		}
	});
}

export function stopStreaming(producer: FiresideProducer, logData: string) {
	trackFiresideStopStreaming(logData);
	return _stopStreaming(producer, true);
}

async function _stopStreaming(producer: FiresideProducer, becomeBusy: boolean) {
	const busyWork = async () => {
		const {
			isStreaming,
			micMuted,
			videoMuted,
			localVideoKit,
			localChatKit,
			_gridChannel,
			logger,
		} = producer;

		if (!isStreaming.value) {
			return;
		}
		isStreaming.value = false;

		// // No need to await on this. its not essential.
		// updateSetIsStreaming(producer);

		// Failure here should end up forcing the app to reload to make
		// absolutely sure they aren't streaming by accident.
		try {
			stopKitStreaming(localVideoKit.value);
			stopKitStreaming(localChatKit.value);

			// If they're not connected to grid, they'll be set as not streaming
			// anyway. So we can ignore if grid isn't connected.
			await _gridChannel.value?.pushSetStream({
				is_streaming_video: false,
				is_streaming_audio_desktop: false,
				is_streaming_audio_mic: false,
			});

			// TODO(big-pp-event) I don't fully understand what this is supposed
			// to do and why we want to call this after the streams are stopped.
			// It looks like this unsets the recording devices which indirectly
			// stops the stream anyways?
			clearSelectedRecordingDevices(producer);
			micMuted.value = false;
			videoMuted.value = false;
		} catch (err) {
			logger.error(`Failed to stop one or more agora channels. Force reloading...`, err);
			Navigate.reload();
			return;
		}

		logger.info(`Stopped streaming.`);
	};

	await (becomeBusy ? _doBusyWork(producer, busyWork) : busyWork());
}

// /**
//  * While we're streaming, anytime our local tracks change, we want to sync a
//  * fake [FiresideRTCHost] to show us as part of the fireside.
//  */
// function _syncLocalUserToRTC(producer: FiresideProducer) {
// 	// TODO(oven)
// 	// return;

// 	const {
// 		isStreaming,
// 		rtc: { userId },
// 		localUser,
// 		localVideoKit,
// 		localChatKit,
// 		logger,
// 	} = producer;

// 	logger.info(`Syncing the host user's tracks into RTC.`);
// 	let user = localUser.value;
// 	const hadUser = !!user;

// 	if (!isStreaming.value) {
// 		if (user) {
// 			logger.info(`Destroying local user since we're no longer streaming.`);

// 			setUserHasVideo(user, false);
// 			setUserHasDesktopAudio(user, false);
// 			setUserHasMicAudio(user, false);

// 			localUser.value = null;

// 			if (rtc.focusedUser === user) {
// 				rtc.focusedUser = null;
// 				chooseFocusedHost(rtc);
// 			}

// 			logger.info(`Destroyed local RTC user.`);
// 		}

// 		logger.info(`Not streaming, nothing to sync.`);
// 		return;
// 	}

// 	const hadVideo = user?.hasVideo === true;
// 	const hadDesktopAudio = user?.hasDesktopAudio === true;
// 	const hadMicAudio = user?.hasMicAudio === true;

// 	const videoStream = localVideoKit.value.localStream.value;
// 	const chatStream = localChatKit.value.localStream.value;

// 	// Upsert the user's local streams.
// 	user ??= createLocalFiresideRTCHost(rtc, userId!);
// 	user._videoMediaStream = videoStream ? markRaw(videoStream) : null;
// 	user._chatMediaStream = chatStream ? markRaw(chatStream) : null;

// 	const hasVideo = Boolean(videoStream && videoStream.getVideoTracks().length > 0);
// 	const hasDesktopAudio = Boolean(videoStream && videoStream.getAudioTracks().length > 0);
// 	const hasMicAudio = Boolean(chatStream && chatStream.getAudioTracks().length > 0);

// 	if (hadVideo !== hasVideo) {
// 		setUserHasVideo(user, hasVideo);
// 		if (!hasVideo) {
// 			producer.videoMuted.value = false;
// 		}
// 	}
// 	if (hadDesktopAudio !== hasDesktopAudio) {
// 		setUserHasDesktopAudio(user, hasDesktopAudio);
// 	}
// 	if (hadMicAudio !== hasMicAudio) {
// 		setUserHasMicAudio(user, hasMicAudio);
// 		if (!hasMicAudio) {
// 			producer.micMuted.value = false;
// 		}
// 	}

// 	localUser.value = user;

// 	// If we just started streaming, choose us as the focused user.
// 	if (!hadUser) {
// 		rtc.focusedUser = user;
// 	}

// 	logger.info(`Synced local user.`, {
// 		hasVideo,
// 		hasDesktopAudio,
// 		hasMicAudio,
// 		hadVideo,
// 		hadDesktopAudio,
// 		hadMicAudio,
// 	});
// }
