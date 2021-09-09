import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { MediaDeviceService } from '../../agora/media-device.service';
import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import { Translate } from '../../translate/translate.service';
import {
	previewChannelVideo,
	setChannelAudioTrack,
	setChannelVideoTrack,
	startChannelStreaming,
	stopChannelStreaming,
} from './channel';
import { FiresideRTC, renewRTCTokens } from './rtc';

const RENEW_TOKEN_INTERVAL = 60_000;

export class FiresideRTCProducer {
	constructor(public readonly rtc: FiresideRTC) {}

	// The target device IDs we want to be streaming with.
	_selectedWebcamDeviceId = '';
	_selectedMicDeviceId = '';
	_selectedDesktopAudioDeviceId = '';
	_selectedGroupAudioDeviceId = 'default';

	// The device IDs we are streaming with.
	_streamingWebcamDeviceId: string | null = null;
	_streamingMicDeviceId: string | null = null;
	_streamingDesktopAudioDeviceId: string | null = null;
	_streamingChatPlaybackDeviceId: string | null = null;

	_isStreaming = false;

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

	get isStreaming() {
		return this._isStreaming;
	}

	get selectedWebcamDeviceId() {
		return this._selectedWebcamDeviceId;
	}

	get selectedMicDeviceId() {
		return this._selectedMicDeviceId;
	}

	get selectedDesktopAudioDeviceId() {
		return this._selectedDesktopAudioDeviceId;
	}

	get selectedGroupAudioDeviceId() {
		return this._selectedGroupAudioDeviceId;
	}
}

export function createFiresideRTCProducer(rtc: FiresideRTC) {
	const producer = new FiresideRTCProducer(rtc);

	MediaDeviceService.detectDevices({ prompt: false });

	producer._tokenRenewInterval = setInterval(() => _renewTokens(producer), RENEW_TOKEN_INTERVAL);

	return producer;
}

export function destroyFiresideRTCProducer(producer: FiresideRTCProducer) {
	producer._isStreaming = false;

	if (producer._tokenRenewInterval) {
		clearInterval(producer._tokenRenewInterval);
		producer._tokenRenewInterval = null;
	}
}

// async function _regenerateClients(producer: FiresideRTCProducer, generation: number) {
// 	if (producer._destroyed || generation !== producer._currentClientGeneration) {
// 		return;
// 	}

// 	try {
// 		if (producer._areClientsRegenerating) {
// 			throw new Error(
// 				'Attempted to regenerate clients before the previous ones finished regenerating. It is no longer possible to restore state.'
// 			);
// 		}

// 		console.log('Regenerating clients');
// 		producer._areClientsRegenerating = true;

// 		const wasStreaming = producer._isStreaming;
// 		destroyFiresideRTCProducer(producer);

// 		const myGeneration = producer._currentClientGeneration;

// 		producer._videoClient = new AgoraStreamingClient(producer._appId, 'video');
// 		producer._videoClient.onDisposed = () => _regenerateClients(producer, myGeneration);
// 		producer._videoClient.onGibToken = () => _renewTokens(producer, true);
// 		producer._chatClient = new AgoraStreamingClient(producer._appId, 'chat');
// 		producer._chatClient.onDisposed = () => _regenerateClients(producer, myGeneration);
// 		producer._chatClient.onGibToken = () => _renewTokens(producer, true);

// 		// Attempt to configure the new clients similarly to how the old clients
// 		// were configured.
// 		console.log('Reconfiguring clients');

// 		await Promise.all([
// 			_updateWebcamDevice(producer),
// 			_updateMicDevice(producer),
// 			_updateDesktopAudioDevice(producer),
// 			_updateGroupAudioDevice(producer),
// 		]);

// 		if (wasStreaming) {
// 			// TODO: change this show a modal where you can confirm to resume
// 			// streaming it'd suck if you lost connection and then it came back
// 			// when youre not around.
// 			await startStreaming(producer);
// 		}
// 	} catch (e) {
// 		console.error('Error while regenerating clients');
// 		console.error(e);
// 		Navigate.reload();
// 	} finally {
// 		producer._areClientsRegenerating = false;
// 	}

// 	// If we got destroyed while regenerating clients, make sure to tear
// 	// everything down
// 	if (producer._destroyed) {
// 		destroyFiresideRTCProducer(producer);
// 	}
// }

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
		const response = await Api.sendRequest(
			'/web/dash/fireside/generate-streaming-tokens/' + fireside.id,
			{},
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
		await renewRTCTokens(rtc, videoToken, chatToken);
	}

	async function _updateAudienceTokens() {
		// We only do this if we're currently streaming.
		if (!producer._isStreaming) {
			return;
		}

		const response = await Api.sendRequest(
			'/web/dash/fireside/set-is-streaming/' + fireside.id,
			{ is_streaming: true },
			{ detach: true }
		);

		if (response?.success !== true) {
			throw new Error(response);
		}

		return response;
	}

	try {
		rtc.log(`Renewing streaming tokens.`);
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
			return await work();
		} finally {
			producer.isBusy = false;
		}
	})();

	producer._busyPromise = p;
	return p;
}

export function setSelectedWebcamDeviceId(
	producer: FiresideRTCProducer,
	newWebcamDeviceId: string
) {
	const videoDeviceChanged = newWebcamDeviceId !== producer._selectedWebcamDeviceId;
	producer._selectedWebcamDeviceId = newWebcamDeviceId;

	if (videoDeviceChanged) {
		_updateWebcamDevice(producer);
	}
}

export function setSelectedMicDeviceId(producer: FiresideRTCProducer, newMicId: string) {
	const micChanged = newMicId !== producer._selectedMicDeviceId;
	producer._selectedMicDeviceId = newMicId;

	if (micChanged) {
		_updateMicDevice(producer);
	}
}

export function setSelectedDesktopAudioDeviceId(
	producer: FiresideRTCProducer,
	newSpeakerId: string
) {
	const speakerChanged = newSpeakerId !== producer._selectedDesktopAudioDeviceId;
	producer._selectedDesktopAudioDeviceId = newSpeakerId;

	if (speakerChanged) {
		_updateDesktopAudioDevice(producer);
	}
}

export function setSelectedGroupAudioDeviceId(producer: FiresideRTCProducer, newSpeakerId: string) {
	const speakerChanged = newSpeakerId !== producer._selectedGroupAudioDeviceId;
	producer._selectedGroupAudioDeviceId = newSpeakerId;

	if (speakerChanged) {
		_updateGroupAudioDevice(producer);
	}
}

function _updateWebcamDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			_selectedWebcamDeviceId,
			rtc,
			rtc: { videoChannel },
		} = producer;

		let deviceId: string | null;
		if (_selectedWebcamDeviceId === '') {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.webcams.find(
				webcam => webcam.deviceId === _selectedWebcamDeviceId
			);
			deviceId = deviceExists ? _selectedWebcamDeviceId : null;
		}

		rtc.log(`Setting video device to ${deviceId}`);
		producer._streamingWebcamDeviceId = deviceId;

		await setChannelVideoTrack(videoChannel, async () => {
			if (!deviceId) {
				return null;
			}

			const track = await AgoraRTC.createCameraVideoTrack({
				cameraId: deviceId,
				optimizationMode: 'motion',
				encoderConfig: {
					bitrateMax: 5_000,
					width: { max: 1280 },
					height: { max: 720 },
					frameRate: { max: 30 },
				},
			});

			rtc.log(`Video webcam track ID: ${track.getTrackId()}`);
			return track;
		});

		if (producer._videoPreviewElement) {
			previewChannelVideo(videoChannel, producer._videoPreviewElement);
		}
	});
}

function _updateDesktopAudioDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			_selectedDesktopAudioDeviceId,
			rtc,
			rtc: { videoChannel },
		} = producer;

		let deviceId: string | null;
		if (_selectedDesktopAudioDeviceId === '') {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.mics.find(
				mic => mic.deviceId === _selectedDesktopAudioDeviceId
			);
			deviceId = deviceExists ? _selectedDesktopAudioDeviceId : null;
		}

		rtc.log(`Setting desktop audio device to ${deviceId}`);
		producer._streamingDesktopAudioDeviceId = deviceId;

		await setChannelAudioTrack(videoChannel, async () => {
			if (!deviceId) {
				return null;
			}

			const track = await AgoraRTC.createMicrophoneAudioTrack({
				microphoneId: deviceId,
				// We disable all this so that it doesn't affect the desktop audio in any way.
				AEC: false,
				AGC: false,
				ANS: false,
			});
			track.setVolume(100);

			rtc.log(`Desktop audio track ID: ${track.getTrackId()}`);
			return track;
		});
	});
}

function _updateMicDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			_selectedMicDeviceId,
			rtc,
			rtc: { chatChannel },
		} = producer;

		let deviceId: string | null;
		if (_selectedMicDeviceId === '') {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.mics.find(
				mic => mic.deviceId === _selectedMicDeviceId
			);
			deviceId = deviceExists ? _selectedMicDeviceId : null;
		}

		rtc.log(`Setting mic device to ${deviceId}`);
		producer._streamingMicDeviceId = deviceId;

		await setChannelAudioTrack(chatChannel, async () => {
			if (!deviceId) {
				return null;
			}

			const track = await AgoraRTC.createMicrophoneAudioTrack({
				microphoneId: deviceId,
			});
			track.setVolume(100);

			rtc.log(`Mic track ID: ${track.getTrackId()}`);
			return track;
		});
	});
}

function _updateGroupAudioDevice(producer: FiresideRTCProducer) {
	return _doBusyWork(producer, async () => {
		const {
			_selectedGroupAudioDeviceId,
			rtc,
			rtc: { chatChannel },
		} = producer;

		const deviceExists = !!MediaDeviceService.speakers.find(
			speaker => speaker.deviceId === _selectedGroupAudioDeviceId
		);

		const deviceId = deviceExists ? _selectedGroupAudioDeviceId : 'default';

		const oldPlaybackDevice = producer._streamingChatPlaybackDeviceId;
		producer._streamingChatPlaybackDeviceId = deviceId;

		rtc.log(`Setting speaker device to ${deviceId ?? null}`);

		// TODO: Do we need this, or does muting already work?
		// if (!this.audioPlaybackEnabled) {
		// 	this.log('Audio playback is not enabled, nothing to do');
		// 	return;
		// }

		rtc.log(`Applying new audio playback device to all remote audio streams.`);

		await Promise.all(
			chatChannel.agoraClient.remoteUsers.map(remoteUser => {
				const audioTrack = remoteUser.audioTrack;
				if (!audioTrack) {
					rtc.log(`- no audio track for user ${remoteUser.uid}`);
					return;
				}

				if (!oldPlaybackDevice && deviceId) {
					audioTrack.play();
				} else if (oldPlaybackDevice && !deviceId) {
					audioTrack.stop();
				}

				return _updateRemoteUserPlaybackDevice(producer, remoteUser);
			})
		);
	});
}

function _updateRemoteUserPlaybackDevice(
	producer: FiresideRTCProducer,
	remoteUser: IAgoraRTCRemoteUser
) {
	const { rtc, _streamingChatPlaybackDeviceId } = producer;

	const audioTrack = remoteUser.audioTrack;
	if (!audioTrack) {
		rtc.log(`- no audio track for user ${remoteUser.uid}`);
		return;
	}

	if (_streamingChatPlaybackDeviceId !== null) {
		rtc.log(`- applying new audio track for user ${remoteUser.uid}`);
		return audioTrack.setPlaybackDevice(_streamingChatPlaybackDeviceId);
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

	producer._videoPreviewElement = element;
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
		if (producer._isStreaming) {
			return;
		}
		producer._isStreaming = true;

		const {
			rtc,
			rtc: { fireside, videoChannel, chatChannel, generation },
		} = producer;

		let response: any = null;
		try {
			response = await Api.sendRequest(
				'/web/dash/fireside/set-is-streaming/' + fireside.id,
				{ is_streaming: true },
				{ detach: true }
			);
		} catch (e) {
			rtc.logWarning(`Got error while trying to set that we're streaming.`, e);
		}

		if (response?.success !== true || generation.isCanceled) {
			rtc.logWarning(`Couldn't start streaming.`, response);

			Growls.error(
				Translate.$gettext(
					`Couldn't start streaming. Either fireside has ended or your permissions to stream have been revoked.`
				)
			);
			producer._isStreaming = false;
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
			Growls.error(Translate.$gettext('Could not start streaming. Try again later.'));
			await _stopStreaming(producer, false);
		}
	});
}

export function stopStreaming(producer: FiresideRTCProducer) {
	return _stopStreaming(producer, true);
}

async function _stopStreaming(producer: FiresideRTCProducer, becomeBusy: boolean) {
	const busyWork = async () => {
		if (!producer._isStreaming) {
			return;
		}
		producer._isStreaming = false;

		const {
			rtc,
			rtc: { fireside, videoChannel, chatChannel },
		} = producer;

		// This just sets the backend to know that they stopped streaming
		// immediately. We don't need to refresh or anything if it fails.
		let response: any = null;
		try {
			response = await Api.sendRequest(
				'/web/dash/fireside/set-is-streaming/' + fireside.id,
				{ is_streaming: false },
				{ detach: true }
			);

			if (response?.success !== true) {
				throw new Error(`API did not return success.`);
			}
		} catch (e) {
			rtc.logWarning(`Got error while setting that we're not streaming.`, e);
		}

		// Failure here should end up forcing the app to reload to make
		// absolutely sure they aren't streaming by accident.
		try {
			await Promise.all([
				stopChannelStreaming(videoChannel),
				stopChannelStreaming(chatChannel),
			]);
		} catch (err) {
			rtc.logError(`Failed to stop one or more agora channels. Force reloading...`, err);
			Navigate.reload();
			return;
		}

		rtc.log(`Stopped streaming.`);
	};

	await (becomeBusy ? _doBusyWork(producer, busyWork) : busyWork());
}
