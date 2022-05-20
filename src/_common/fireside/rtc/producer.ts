import type { IAgoraRTCRemoteUser, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import { markRaw, reactive } from 'vue';
import { MediaDeviceService } from '../../agora/media-device.service';
import { Api } from '../../api/api.service';
import type { ASGController } from '../../client/asg/asg';
import { startDesktopAudioCapture } from '../../client/safe-exports';
import { importNoSSR } from '../../code-splitting';
import { showErrorGrowl } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import {
	SettingStreamProducerDesktopAudioDevice,
	SettingStreamProducerGroupAudio,
	SettingStreamProducerMic,
	SettingStreamProducerShouldStreamDesktopAudio,
	SettingStreamProducerWebcam,
} from '../../settings/settings.service';
import { Translate } from '../../translate/translate.service';
import {
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

// const registry = new FinalizationRegistry((id: number) => {
// 	asg.endCapture();
// });

// class ASGComponent {
// 	constructor() {
// 		registry.register(this, 1);
// 		this.emitter = new EventEmitter();

// 		this.emitter
// 			.on('status_update', (text: string) => {
// 				console.log('Status update: ' + text, true);
// 				if (text == 'Recording ends') {
// 					this.generator.writable.getWriter().close();
// 				} else if (text == 'Recording starts') {
// 					console.log('ASG: Recording Starts');
// 				} else if (text == 'Starting capturer') {
// 					console.log('ASG: Starting capasasdasdturer');
// 				}
// 			})
// 			.on('error', (text: string) => {
// 				console.log('Caught error: ' + text, true);
// 				this.endCapture();
// 			})
// 			.on('data', (data: Float32Array) => {
// 				const stereoFrameCount = data.length / 2;
// 				const currTimeLength = (stereoFrameCount * 1000000) / 44100;
// 				this.nextTimestamp += currTimeLength;
// 				const audioData = new AudioData({
// 					format: 'f32',
// 					numberOfChannels: 2,
// 					numberOfFrames: stereoFrameCount,
// 					timestamp: this.nextTimestamp,
// 					sampleRate: 44100,
// 					data: data,
// 				});

// 				if (this.writer) {
// 					this.writer.write(audioData);
// 					console.log('ASG: WRITER IS VALID');
// 				} else console.log('ASG: WRITER IS NOT VALID');
// 			});
// 	}

// 	startCapture() {
// 		if (this.isCapturing) return; // crashes without this
// 		this.endCapture();
// 		console.log('ASG: Excluded PPID : ' + ppid);
// 		asg.startCapture(ppid, this.emitter.emit.bind(this.emitter));
// 		this.isCapturing = true;
// 	}

// 	endCapture() {
// 		if (this.isCapturing) {
// 			console.log('ASG: Ending Capture ');
// 			asg.endCapture();
// 			this.isCapturing = false;
// 		}
// 	}

// 	async startASG() {
// 		try {
// 			this.startCapture();
// 			console.log('ASG: Swapping to new track.');
// 			this.generator = new MediaStreamTrackGenerator({ kind: 'audio' });
// 			this.writer = this.generator.writable.getWriter();
// 			this.writer.closed.then(() => {
// 				console.log('ASG: Track write stream is closed');
// 			});
// 		} catch (error) {
// 			console.log(error);
// 			this.emitter.removeAllListeners();
// 		}
// 	}

// 	getMediaStreamTrack() {
// 		if (!this.generator) console.log('ASG Generator invalid!');
// 		return this.generator;
// 	}

// 	endASG() {
// 		if (this.isCapturing) {
// 			asg.endCapture();
// 			this.isCapturing = false;
// 		} else console.log('ASG: Invalid call! CHECK CALLER');
// 	}

// 	generator: MediaStreamTrackGenerator<AudioData> | any;
// 	nextTimestamp = 0;
// 	emitter: any;
// 	writer: any;
// 	isCapturing = false;
// }

export class FiresideRTCProducer {
	constructor(public readonly rtc: FiresideRTC) {}
	// asgComponent: ASGComponent | null = null;
	// The target device IDs we want to be streaming with.
	selectedWebcamDeviceId = '';
	selectedMicDeviceId = '';
	selectedDesktopAudioDeviceId = '';
	selectedGroupAudioDeviceId = '';

	shouldStreamDesktopAudio = false;

	// The device IDs we are streaming with.
	streamingWebcamDeviceId: string | null = null;
	streamingMicDeviceId: string | null = null;
	streamingDesktopAudioDeviceId: string | null = null;
	streamingChatPlaybackDeviceId: string | null = null;
	streamingASG: ASGController | null = null;

	isStreaming = false;

	_videoPreviewElement: HTMLDivElement | null = null;

	isBusy = false;
	_busyPromise: Promise<any> = Promise.resolve();

	_tokenRenewInterval: NodeJS.Timer | null = null;
	_areTokensRenewing = false;

	get canStreamVideo() {
		return this.rtc.role?.can_stream_video === true;
	}

	get canStreamAudio() {
		return this.rtc.role?.can_stream_audio === true;
	}
}

export function createFiresideRTCProducer(rtc: FiresideRTC) {
	rtc.log('Trace(createFiresideRTCProducer)');
	const producer = reactive(new FiresideRTCProducer(rtc)) as FiresideRTCProducer;

	MediaDeviceService.detectDevices({ prompt: false });

	producer._tokenRenewInterval = setInterval(() => _renewTokens(producer), RENEW_TOKEN_INTERVAL);

	return producer;
}

/**
 * Cleans up watchers and intervals that may be used by the producer.
 * This does NOT stop streaming or close channels. It's is meant to be used
 * to cleanup the producer instance after we no longer need it.
 */
export function cleanupFiresideRTCProducer(producer: FiresideRTCProducer) {
	console.log('[FIRESIDE-RTC] Trace(cleanupFiresideRTCProducer)');

	// TODO(big-pp-event) theres nothing to prevent a queued up startStream
	// to get executed after cleanup is called on the same instance.
	producer.isStreaming = false;

	if (producer._tokenRenewInterval) {
		clearInterval(producer._tokenRenewInterval);
		producer._tokenRenewInterval = null;
	}
}

export function assignPreferredProducerDevices(producer: FiresideRTCProducer) {
	const { webcams, mics, speakers } = MediaDeviceService;

	const selectedWebcam = SettingStreamProducerWebcam.get();
	const selectedMic = SettingStreamProducerMic.get();
	const selectedDesktop = SettingStreamProducerDesktopAudioDevice.get();
	const selectedGroup = SettingStreamProducerGroupAudio.get();

	const isWebcamUnset = selectedWebcam === PRODUCER_UNSET_DEVICE;
	const isMicUnset = selectedMic === PRODUCER_UNSET_DEVICE;
	const isDesktopUnset = selectedDesktop === PRODUCER_UNSET_DEVICE;
	const isGroupUnset = selectedGroup === PRODUCER_UNSET_DEVICE;

	let preferredWebcam: MediaDeviceInfo | null = null;
	let preferredMic: MediaDeviceInfo | null = null;
	let preferredDesktop: MediaDeviceInfo | null = null;
	let preferredGroup: MediaDeviceInfo | null = null;
	let fallbackWebcam: MediaDeviceInfo | null = null;
	let fallbackMic: MediaDeviceInfo | null = null;
	let fallbackDesktop: MediaDeviceInfo | null = null;
	let fallbackGroup: MediaDeviceInfo | null = null;

	for (const device of webcams.value) {
		if (isWebcamUnset) {
			break;
		}

		if (device.deviceId === selectedWebcam) {
			preferredWebcam = device;
			break;
		}

		const label = device.label.toLowerCase();
		if (!fallbackWebcam && label.includes('obs virtual camera')) {
			fallbackWebcam = device;
		} else if (!fallbackWebcam && label.includes('obs')) {
			fallbackWebcam = device;
		}
	}

	for (const device of mics.value) {
		if (!isMicUnset && device.deviceId === selectedMic) {
			preferredMic = device;
		} else if (!isDesktopUnset && device.deviceId === selectedDesktop) {
			preferredDesktop = device;
		}

		if ((preferredMic || isMicUnset) && (preferredDesktop || isDesktopUnset)) {
			break;
		}

		const label = device.label.toLowerCase();
		if (!isMicUnset && !fallbackMic && label.includes('default')) {
			fallbackMic = device;
		} else if (!isDesktopUnset && !fallbackDesktop && label.includes('voicemeeter output')) {
			fallbackDesktop = device;
		}
	}

	for (const device of speakers.value) {
		if (isGroupUnset) {
			break;
		}

		if (device.deviceId === selectedGroup) {
			preferredGroup = device;
			break;
		}

		const label = device.label.toLowerCase();
		if (!fallbackGroup && label.includes('voicemeeter aux input')) {
			fallbackGroup = device;
		}
	}

	setSelectedWebcamDeviceId(
		producer,
		(preferredWebcam ?? fallbackWebcam)?.deviceId ?? PRODUCER_UNSET_DEVICE
	);
	setSelectedMicDeviceId(
		producer,
		(preferredMic ?? fallbackMic)?.deviceId ?? PRODUCER_UNSET_DEVICE
	);
	// setSelectedDesktopAudioDeviceId(
	// 	producer,
	// 	(preferredDesktop ?? fallbackDesktop)?.deviceId ?? PRODUCER_UNSET_DEVICE
	// );
	setShouldStreamDesktopAudio(producer, true);
	setSelectedGroupAudioDeviceId(
		producer,
		(preferredGroup ?? fallbackGroup)?.deviceId ?? PRODUCER_DEFAULT_GROUP_AUDIO
	);
}

async function _renewTokens(producer: FiresideRTCProducer) {
	if (producer._areTokensRenewing) {
		return;
	}

	const {
		rtc,
		rtc: { fireside, generation },
	} = producer;

	producer._areTokensRenewing = true;

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
		if (!producer.isStreaming) {
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
		producer._areTokensRenewing = false;
	}
}

// Does some work serially.
function _doBusyWork<T>(producer: FiresideRTCProducer, work: () => Promise<T>) {
	const p = (async () => {
		// Wait for any previous work to finish first.
		await producer._busyPromise;

		producer.isBusy = true;
		try {
			const ret = await work();

			// Sync any changes to our local user in the RTC after any work was
			// done.
			_syncLocalUserToRTC(producer);

			return ret;
		} finally {
			producer.isBusy = false;
		}
	})();

	producer._busyPromise = p;
	return p;
}

export function setSelectedWebcamDeviceId(
	producer: FiresideRTCProducer,
	newWebcamDeviceId: string,
	savePref = true
) {
	const { webcams } = MediaDeviceService;
	const videoDeviceChanged = newWebcamDeviceId !== producer.selectedWebcamDeviceId;
	producer.selectedWebcamDeviceId = newWebcamDeviceId;

	if (webcams.value.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerWebcam.set(newWebcamDeviceId);
	}

	if (videoDeviceChanged) {
		_updateWebcamDevice(producer);
	}
}

export function setSelectedMicDeviceId(
	producer: FiresideRTCProducer,
	newMicId: string,
	savePref = true
) {
	const { mics } = MediaDeviceService;
	const micChanged = newMicId !== producer.selectedMicDeviceId;
	producer.selectedMicDeviceId = newMicId;

	if (mics.value.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerMic.set(newMicId);
	}

	if (micChanged) {
		_updateMicDevice(producer);
	}
}

export function setShouldStreamDesktopAudio(
	producer: FiresideRTCProducer,
	shouldStream: boolean,
	savePref = true
) {
	const changed = shouldStream !== producer.shouldStreamDesktopAudio;
	producer.shouldStreamDesktopAudio = shouldStream;

	if (savePref) {
		SettingStreamProducerShouldStreamDesktopAudio.set(shouldStream);
	}

	if (changed) {
		_updateDesktopAudioDevice(producer);
	}
}

export function setSelectedDesktopAudioDeviceId(
	producer: FiresideRTCProducer,
	newSpeakerId: string,
	savePref = true
) {
	const { mics } = MediaDeviceService;
	const speakerChanged = newSpeakerId !== producer.selectedDesktopAudioDeviceId;
	producer.selectedDesktopAudioDeviceId = newSpeakerId;

	if (mics.value.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerDesktopAudioDevice.set(newSpeakerId);
	}

	if (speakerChanged) {
		_updateDesktopAudioDevice(producer);
	}
}

export function setSelectedGroupAudioDeviceId(
	producer: FiresideRTCProducer,
	newSpeakerId: string,
	savePref = true
) {
	const { speakers } = MediaDeviceService;
	const speakerChanged = newSpeakerId !== producer.selectedGroupAudioDeviceId;
	producer.selectedGroupAudioDeviceId = newSpeakerId;

	if (speakers.value.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerGroupAudio.set(newSpeakerId);
	}

	if (speakerChanged) {
		_updateGroupAudioDevice(producer);
	}
}

export function clearSelectedRecordingDevices(producer: FiresideRTCProducer) {
	setSelectedWebcamDeviceId(producer, PRODUCER_UNSET_DEVICE, false);
	setSelectedMicDeviceId(producer, PRODUCER_UNSET_DEVICE, false);
	setSelectedDesktopAudioDeviceId(producer, PRODUCER_UNSET_DEVICE, false);
}

function _updateWebcamDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedWebcamDeviceId,
			rtc,
			rtc: { videoChannel },
		} = producer;
		const { webcams } = MediaDeviceService;

		let deviceId: string | null;
		if (selectedWebcamDeviceId === '' || selectedWebcamDeviceId === PRODUCER_UNSET_DEVICE) {
			deviceId = null;
		} else {
			const deviceExists = !!webcams.value.find(i => i.deviceId === selectedWebcamDeviceId);
			deviceId = deviceExists ? selectedWebcamDeviceId : null;
		}

		rtc.log(`Setting video device to ${deviceId}`);
		producer.streamingWebcamDeviceId = deviceId;

		await setChannelVideoTrack(videoChannel, {
			async trackBuilder() {
				if (!deviceId) {
					return null;
				}

				let width = 1280;
				let height = 720;
				let fps = 30;
				let bitrate = 5_000;
				let mode = 'motion' as 'motion' | 'detail';
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
				// 		resizeMode: 'crop-and-scale',
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

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);

		if (producer._videoPreviewElement) {
			previewChannelVideo(videoChannel, producer._videoPreviewElement);
		}
	});
}

export interface SetIsStreamingOptions {
	isStreaming?: boolean;
}

export async function updateSetIsStreaming(
	producer: FiresideRTCProducer,
	options?: SetIsStreamingOptions
) {
	const { rtc } = producer;

	// We want to be able to bypass the producer's _isStreaming setting
	// because during cleanup we may call this before the producer has actually
	// disposed of their streams and we don't want to wait on that.
	const isStreaming = options?.isStreaming ?? producer.isStreaming;

	let response: any = null;

	try {
		response = await Api.sendRequest(
			'/web/dash/fireside/set-is-streaming/' + rtc.fireside.id,
			{
				is_streaming: isStreaming,
				streaming_uid: rtc.streamingUid,
				has_video:
					producer.selectedWebcamDeviceId !== PRODUCER_UNSET_DEVICE &&
					rtc.videoChannel._localVideoTrack !== null,
				has_mic_audio:
					producer.selectedMicDeviceId !== PRODUCER_UNSET_DEVICE &&
					rtc.chatChannel._localAudioTrack !== null,
				has_desktop_audio:
					producer.shouldStreamDesktopAudio &&
					// producer.selectedDesktopAudioDeviceId !== PRODUCER_UNSET_DEVICE &&
					rtc.videoChannel._localAudioTrack !== null,
			},
			{ detach: true }
		);
	} catch (e) {
		rtc.logWarning(`Got error while trying to set what we're streaming.`, e);
	}

	return response;
}

function _updateDesktopAudioDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedDesktopAudioDeviceId,
			shouldStreamDesktopAudio,
			rtc,
			rtc: { videoChannel },
		} = producer;
		const { mics } = MediaDeviceService;

		let deviceId: string | null;
		if (
			selectedDesktopAudioDeviceId === '' ||
			selectedDesktopAudioDeviceId === PRODUCER_UNSET_DEVICE
		) {
			deviceId = null;
		} else {
			const deviceExists = !!mics.value.find(
				i => i.deviceId === selectedDesktopAudioDeviceId
			);
			deviceId = deviceExists ? selectedDesktopAudioDeviceId : null;
		}

		rtc.log(`Setting desktop audio device to ${deviceId}`);
		producer.streamingDesktopAudioDeviceId = deviceId;

		await setChannelAudioTrack(videoChannel, {
			async trackBuilder() {
				if (!shouldStreamDesktopAudio) {
					return null;
				}

				const AgoraRTC = await AgoraRTCLazy;
				let track: ILocalAudioTrack | undefined;

				// If a device was set for streaming, we want to use that
				// instead of using ASG.
				if (deviceId) {
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
					rtc.log(`Creating desktop audio track from ASG.`);

					const generator = new MediaStreamTrackGenerator({ kind: 'audio' });
					producer.streamingASG = startDesktopAudioCapture(generator.writable);

					track = AgoraRTC.createCustomAudioTrack({
						mediaStreamTrack: generator,
						encoderConfig: 'high_quality_stereo',
					});
				}

				// if (!deviceId) {
				// 	return null;
				// }

				// const generator = new MediaStreamTrackGenerator({ kind: 'audio' });
				// const asgInstance = startDesktopAudioCapture(generator.writable);
				// // TODO asgInstance is what youd use to stop this later like so: stopCapture(asgInstance)
				// console.log(asgInstance);

				// // console.log('ASG: CREATE CUSTOM');
				// // await producer.asgComponent.startASG();

				// const AgoraRTC = await AgoraRTCLazy;
				// const track = await AgoraRTC.createCustomAudioTrack({
				// 	// mediaStreamTrack: producer.asgComponent.getMediaStreamTrack(),
				// 	mediaStreamTrack: generator,
				// 	encoderConfig: 'high_quality_stereo',
				// 	//AEC: false,
				// 	//AGC: false,
				// 	//ANS: false,
				// });

				//const track = await AgoraRTC.createMicrophoneAudioTrack({
				//	microphoneId: deviceId,
				//	// We disable all this so that it doesn't affect the desktop audio in any way.
				//	AEC: false,
				//	AGC: false,
				//	ANS: false,
				//	encoderConfig: 'high_quality_stereo',
				//});
				track.setVolume(100);

				rtc.log(`Desktop audio track ID: ${track.getTrackId()}`);

				return track;
			},
			async onTrackClose() {
				// Only need to close the track if we're streaming the desktop
				// audio with ASG.
				if (!producer.streamingASG) {
					return;
				}

				rtc.log(`Stop streaming desktop audio through ASG.`);

				await producer.streamingASG.stop();
				producer.streamingASG = null;

				rtc.log(`Stopped streaming desktop audio ASG.`);
			},
		});

		// No need to await on this. its not essential.
		updateSetIsStreaming(producer);
	});
}

function _updateMicDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedMicDeviceId,
			rtc,
			rtc: { chatChannel },
		} = producer;
		const { mics } = MediaDeviceService;

		let deviceId: string | null;
		if (selectedMicDeviceId === '' || selectedMicDeviceId === PRODUCER_UNSET_DEVICE) {
			deviceId = null;
		} else {
			const deviceExists = !!mics.value.find(i => i.deviceId === selectedMicDeviceId);
			deviceId = deviceExists ? selectedMicDeviceId : null;
		}

		rtc.log(`Setting mic device to ${deviceId}`);
		producer.streamingMicDeviceId = deviceId;

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
	});
}

function _updateGroupAudioDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			selectedGroupAudioDeviceId,
			rtc,
			rtc: { chatChannel, videoChannel },
		} = producer;
		const { speakers } = MediaDeviceService;

		const deviceExists = !!speakers.value.find(i => i.deviceId === selectedGroupAudioDeviceId);

		const deviceId = deviceExists ? selectedGroupAudioDeviceId : PRODUCER_DEFAULT_GROUP_AUDIO;

		rtc.log(`Setting speaker device to ${deviceId}`);
		producer.streamingChatPlaybackDeviceId = deviceId;

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

	if (streamingChatPlaybackDeviceId !== null) {
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
	const deviceId = producer.streamingChatPlaybackDeviceId;
	if (deviceId !== null) {
		try {
			// This will throw an error if they're not on Chrome.
			return track.setPlaybackDevice(deviceId);
		} catch {}
	}
}

export function setVideoPreviewElement(
	producer: FiresideRTCProducer,
	element: HTMLDivElement | null
) {
	const {
		_videoPreviewElement,
		rtc: { videoChannel },
	} = producer;

	if (_videoPreviewElement && _videoPreviewElement !== element) {
		_videoPreviewElement.innerHTML = '';
	}

	producer._videoPreviewElement = element ? markRaw(element) : null;
	if (element) {
		previewChannelVideo(videoChannel, element);
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
		if (producer.isStreaming) {
			return;
		}
		producer.isStreaming = true;

		const {
			rtc,
			rtc: { videoChannel, chatChannel },
		} = producer;
		const generation = rtc.generation;

		const response = await updateSetIsStreaming(producer);

		if (response?.success !== true || generation.isCanceled) {
			rtc.logWarning(`Couldn't start streaming.`, response);

			showErrorGrowl(
				Translate.$gettext(
					`Couldn't start streaming. Either fireside has ended, your permissions to stream have been revoked or you have a running stream elsewhere.`
				)
			);
			producer.isStreaming = false;
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
		if (!producer.isStreaming) {
			return;
		}
		producer.isStreaming = false;

		const {
			rtc,
			rtc: { videoChannel, chatChannel },
		} = producer;

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
		rtc,
		rtc: { streamingUid, videoChannel, chatChannel },
	} = producer;

	rtc.log(`Syncing the host user's tracks into RTC.`);
	let user = rtc.localUser;
	const hadUser = !!user;

	if (!producer.isStreaming) {
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
	}
	if (hadDesktopAudio !== hasDesktopAudio) {
		setUserHasDesktopAudio(user, hasDesktopAudio);
	}
	if (hadMicAudio !== hasMicAudio) {
		setUserHasMicAudio(user, hasMicAudio);
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
