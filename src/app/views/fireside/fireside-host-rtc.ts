import Vue from 'vue';
import { AgoraStreamingClient } from '../../../_common/agora/agora-streaming-client';
import { MediaDeviceService } from '../../../_common/agora/media-device.service';
import { Api } from '../../../_common/api/api.service';
import { FiresideRole } from '../../../_common/fireside/role/role.model';
import { Growls } from '../../../_common/growls/growls.service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { Translate } from '../../../_common/translate/translate.service';

const RENEW_TOKEN_CHECK_INTERVAL = 10_000;
const RENEW_TOKEN_INTERVAL = 60_000;

export class FiresideHostRtc {
	private appId = '';
	private userId = 0;
	private firesideId = 0;
	private role: FiresideRole = null as any;

	// The target device ids we want to be streaming to.
	private p_selectedWebcamDeviceId = '';
	private p_selectedMicDeviceId = '';
	private p_selectedDesktopAudioDeviceId = '';
	private p_selectedGroupAudioDeviceId = '';
	private p_isStreaming = false;

	private videoPreviewElement: HTMLDivElement | null = null;

	public isBusy = false;
	private busyPromise: Promise<any> = Promise.resolve();

	private videoClient: AgoraStreamingClient | null = null;
	private chatClient: AgoraStreamingClient | null = null;

	private tokenRenewInterval: NodeJS.Timer | null = null;
	private areTokensRenewing = false;
	private lastRenewedTokens = 0;

	// Video and chat rtc clients are created and managed in pairs.
	// When either client gets disposed for whatever reason, the other client
	// should also get disposed.
	//
	// These are used to keep the clients in sync.
	private currentClientGeneration = 0;
	private areClientsRegenerating = false;
	private destroyed = false;

	constructor(appId: string, userId: number, firesideId: number, role: FiresideRole) {
		this.appId = appId;
		this.userId = userId;
		this.firesideId = firesideId;
		this.role = role;

		MediaDeviceService.detectDevices({ prompt: false });
		this.regenerateClients(this.currentClientGeneration);
		this.tokenRenewInterval = setInterval(
			() => this.renewTokens(false),
			RENEW_TOKEN_CHECK_INTERVAL
		);

		Vue.set(this, 'p_isStreaming', false);
	}

	destroy() {
		this.destroyed = true;

		if (this.tokenRenewInterval !== null) {
			clearInterval(this.tokenRenewInterval);
			this.tokenRenewInterval = null;
		}

		// In this case, disposing will be done as part of the regenerateClients func.
		if (this.areClientsRegenerating) {
			return;
		}

		this._destroy();
	}

	private _destroy() {
		this.currentClientGeneration++;

		this.videoClient?.dispose();
		this.chatClient?.dispose();

		this.videoClient = null;
		this.chatClient = null;
		this.p_isStreaming = false;
	}

	private async regenerateClients(generation: number) {
		if (this.destroyed || generation !== this.currentClientGeneration) {
			return;
		}

		try {
			if (this.areClientsRegenerating) {
				throw new Error(
					'Attempted to regenerate clients before the previous ones finished regenerating. It is no longer possible to restore state.'
				);
			}

			console.log('Regenerating clients');
			this.areClientsRegenerating = true;

			const wasStreaming = this.p_isStreaming;
			this._destroy();

			const myGeneration = this.currentClientGeneration;

			this.videoClient = new AgoraStreamingClient(this.appId, 'video');
			this.videoClient.onDisposed = () => this.regenerateClients(myGeneration);
			this.videoClient.onGibToken = () => this.renewTokens(true);
			this.chatClient = new AgoraStreamingClient(this.appId, 'chat');
			this.chatClient.onDisposed = () => this.regenerateClients(myGeneration);
			this.chatClient.onGibToken = () => this.renewTokens(true);

			// Attempt to configure the new clients similarly to how the old clients were configured.
			console.log('Reconfiguring clients');

			await Promise.all([
				this.updateWebcamDevice(),
				this.updateMicDevice(),
				this.updateDesktopAudioDevice(),
				this.updateGroupAudioDevice(),
			]);

			if (wasStreaming) {
				// TODO: change this show a modal where you can confirm to resume streaming
				// it'd suck if you lost connection and then it came back when youre not around.
				await this.startStreaming();
			}
		} catch (e) {
			console.error('Error while regenerating clients');
			console.error(e);
			Navigate.reload();
		} finally {
			this.areClientsRegenerating = false;
		}

		// If we got destroyed while regenerating clients, make sure to tear everything down
		if (this.destroyed) {
			this._destroy();
		}
	}

	private async renewTokens(force: boolean) {
		if (this.areTokensRenewing) {
			return;
		}

		if (!this.isStreaming) {
			return;
		}

		if (!force && Date.now() - this.lastRenewedTokens < RENEW_TOKEN_INTERVAL) {
			return;
		}

		const myGeneration = this.currentClientGeneration;
		this.areTokensRenewing = true;

		try {
			console.log('Renewing tokens (force: ' + (force ? 'true' : 'false') + ')');

			let response: any = null;
			try {
				response = await Api.sendRequest(
					'/web/dash/fireside/generate-streaming-tokens/' + this.firesideId,
					{},
					{ detach: true }
				);
			} catch (e) {
				console.warn('Got error while renewing tokens', e);
			}

			if (this.currentClientGeneration !== myGeneration) {
				return;
			}

			if (!response || !response.success) {
				console.warn('Failed to renew tokens', response);
				return;
			}

			const videoChannelToken = response.videoChannelToken;
			const chatChannelToken = response.audioChatChannelToken;

			const currentVideoClient = this.videoClient;
			if (!currentVideoClient || currentVideoClient.isDisposed) {
				throw new Error('Video client is undefined or disposed');
			}

			const currentChatClient = this.chatClient;
			if (!currentChatClient || currentChatClient.isDisposed) {
				throw new Error('Chat client is undefined or disposed');
			}

			await Promise.all([
				currentVideoClient.setToken(videoChannelToken),
				currentChatClient.setToken(chatChannelToken),
			]);

			this.lastRenewedTokens = Date.now();
		} finally {
			this.areTokensRenewing = false;
		}
	}

	// Does some work serially.
	private doBusyWork<T>(work: () => Promise<T>) {
		let resolver: (arg: T | PromiseLike<T>) => void;
		let rejector: (reason: any) => void;

		const p = new Promise<T>((resolve, reject) => {
			resolver = resolve;
			rejector = reject;
		});

		this.busyPromise = this.busyPromise
			.then(() => (this.isBusy = true))
			.then(async () => {
				try {
					const res = await work();
					resolver(res);
				} catch (e) {
					rejector(e);
				}
			})
			.finally(() => (this.isBusy = false));

		return p;
	}

	get canStreamVideo() {
		return !!this.role.can_stream_video;
	}

	get canStreamAudio() {
		return !!this.role.can_stream_audio;
	}

	get selectedWebcamDeviceId() {
		return this.p_selectedWebcamDeviceId;
	}

	set selectedWebcamDeviceId(newWebcamDeviceId: string) {
		console.log('setting webcam device id to ' + newWebcamDeviceId);
		const videoDeviceChanged = newWebcamDeviceId !== this.p_selectedWebcamDeviceId;
		this.p_selectedWebcamDeviceId = newWebcamDeviceId;

		if (videoDeviceChanged) {
			this.updateWebcamDevice();
		}
	}

	get selectedMicDeviceId() {
		return this.p_selectedMicDeviceId;
	}

	set selectedMicDeviceId(newMicId: string) {
		const micChanged = newMicId !== this.p_selectedMicDeviceId;
		this.p_selectedMicDeviceId = newMicId;

		if (micChanged) {
			this.updateMicDevice();
		}
	}

	get selectedDesktopAudioDeviceId() {
		return this.p_selectedDesktopAudioDeviceId;
	}

	set selectedDesktopAudioDeviceId(newSpeakerId: string) {
		const speakerChanged = newSpeakerId !== this.p_selectedDesktopAudioDeviceId;
		this.p_selectedDesktopAudioDeviceId = newSpeakerId;

		if (speakerChanged) {
			this.updateDesktopAudioDevice();
		}
	}

	get selectedGroupAudioDeviceId() {
		return this.p_selectedGroupAudioDeviceId;
	}

	set selectedGroupAudioDeviceId(newSpeakerId: string) {
		const speakerChanged = newSpeakerId !== this.p_selectedGroupAudioDeviceId;
		this.p_selectedGroupAudioDeviceId = newSpeakerId;

		if (speakerChanged) {
			this.updateGroupAudioDevice();
		}
	}

	private updateWebcamDevice() {
		return this.doBusyWork(async () => {
			let deviceId: string | null;

			if (this.p_selectedWebcamDeviceId === '') {
				deviceId = null;
			} else {
				const deviceExists = !!MediaDeviceService.webcams.find(
					webcam => webcam.deviceId === this.p_selectedWebcamDeviceId
				);
				deviceId = deviceExists ? this.p_selectedWebcamDeviceId : null;
			}

			await this.videoClient?.setVideoDevice(deviceId);
			if (this.videoPreviewElement) {
				this.videoClient?.previewVideo(this.videoPreviewElement);
			}
		});
	}

	private updateMicDevice() {
		return this.doBusyWork(async () => {
			let deviceId: string | null;

			if (this.p_selectedMicDeviceId === '') {
				deviceId = null;
			} else {
				const deviceExists = !!MediaDeviceService.mics.find(
					mic => mic.deviceId === this.p_selectedMicDeviceId
				);
				deviceId = deviceExists ? this.p_selectedMicDeviceId : null;
			}

			return this.chatClient?.setMicDevice(deviceId);
		});
	}

	private updateDesktopAudioDevice() {
		return this.doBusyWork(async () => {
			let deviceId: string | null;

			if (this.p_selectedDesktopAudioDeviceId === '') {
				deviceId = null;
			} else {
				const deviceExists = !!MediaDeviceService.mics.find(
					mic => mic.deviceId === this.p_selectedDesktopAudioDeviceId
				);
				deviceId = deviceExists ? this.p_selectedDesktopAudioDeviceId : null;
			}

			return this.videoClient?.setVirtualMicDevice(deviceId);
		});
	}

	private updateGroupAudioDevice() {
		return this.doBusyWork(async () => {
			let deviceId: string | null;

			if (this.p_selectedGroupAudioDeviceId === '') {
				deviceId = null;
			} else {
				const deviceExists = !!MediaDeviceService.speakers.find(
					speaker => speaker.deviceId === this.p_selectedGroupAudioDeviceId
				);
				deviceId = deviceExists ? this.p_selectedGroupAudioDeviceId : null;
			}

			return this.chatClient?.setSpeakerDevice(deviceId);
		});
	}

	setVideoPreviewElement(element: HTMLDivElement | null) {
		if (this.videoPreviewElement && this.videoPreviewElement !== element) {
			this.videoPreviewElement.innerHTML = '';
		}

		this.videoPreviewElement = element;
		if (this.videoPreviewElement) {
			this.videoClient?.previewVideo(this.videoPreviewElement);
		}
	}

	getDesktopAudioVolume() {
		if (!this.videoClient || this.videoClient.isDisposed) {
			return 0;
		}

		return this.videoClient!.getVirtualAudioInputVolume();
	}

	getMicAudioVolume() {
		if (!this.chatClient || this.chatClient.isDisposed) {
			return 0;
		}

		return this.chatClient!.getAudioInputVolume();
	}

	get isStreaming() {
		return this.p_isStreaming;
	}

	get isPoorNetworkQuality() {
		if (
			!this.videoClient ||
			this.videoClient.isDisposed ||
			!this.chatClient ||
			this.chatClient.isDisposed
		) {
			return true;
		}

		return this.videoClient.isPoorNetworkQuality || this.chatClient.isPoorNetworkQuality;
	}

	async startStreaming() {
		await this.doBusyWork(async () => {
			if (this.p_isStreaming) {
				return;
			}

			Vue.set(this, 'p_isStreaming', true);

			let response: any = null;
			try {
				response = await Api.sendRequest(
					'/web/dash/fireside/generate-streaming-tokens/' + this.firesideId,
					{},
					{
						detach: true,
					}
				);
			} catch (e) {
				console.warn('Got error while getting streaming tokens to start streaming', e);
			}

			console.log(response);

			if (!response || !response.success) {
				console.warn('Could not start streaming', response);

				Growls.error(
					Translate.$gettext(
						'Could not start streaming. Either fireside has ended or your permissions to stream have been revoked.'
					)
				);
				Vue.set(this, 'p_isStreaming', false);
				return;
			}

			this.lastRenewedTokens = Date.now();

			const videoChannel = response.videoChannel;
			const videoChannelToken = response.videoChannelToken;
			const chatChannel = response.audioChatChannel;
			const chatChannelToken = response.audioChatChannelToken;

			try {
				const currentVideoClient = this.videoClient;
				if (!currentVideoClient || currentVideoClient.isDisposed) {
					throw new Error('Video client is undefined or disposed');
				}

				const currentChatClient = this.chatClient;
				if (!currentChatClient || currentChatClient.isDisposed) {
					throw new Error('Chat client is undefined or disposed');
				}

				const [videoResult, chatResult] = await Promise.allSettled([
					currentVideoClient
						.joinChannel(videoChannel, videoChannelToken, this.userId)
						.then(() => currentVideoClient.startVideoStream()),
					currentChatClient
						.enableAudioPlayback()
						.then(() =>
							currentChatClient.joinChannel(
								chatChannel,
								chatChannelToken,
								this.userId
							)
						)
						.then(() => currentChatClient.startChatStream()),
				]);

				if (videoResult.status !== 'fulfilled') {
					throw new Error('Video channel failed to start streaming');
				}

				if (chatResult.status !== 'fulfilled') {
					throw new Error('Chat channel failed to start streaming');
				}

				console.log('Started streaming');
			} catch (err) {
				console.error(err);
				Growls.error(Translate.$gettext('Could not start streaming. Try again later'));
				await this._stopStreaming(false);
			}
		});
	}

	stopStreaming() {
		return this._stopStreaming(true);
	}

	private async _stopStreaming(becomeBusy: boolean) {
		const busyWork = async () => {
			if (!this.p_isStreaming) {
				return;
			}

			try {
				const currentVideoClient = this.videoClient;
				if (!currentVideoClient || currentVideoClient.isDisposed) {
					throw new Error('Video client is undefined or disposed');
				}

				const currentChatClient = this.chatClient;
				if (!currentChatClient || currentChatClient.isDisposed) {
					throw new Error('Chat client is undefined or disposed');
				}

				// Failure here should end up forcing the app to reload to make absolutely sure they aren't streaming by accident.
				await Promise.all([
					currentVideoClient.stopStream().then(() => currentVideoClient.leaveChannel()),
					currentChatClient.stopStream().then(() => currentChatClient.leaveChannel()),
				]);
			} catch (err) {
				console.error(err);
				console.error('Failed to stop one or more agora channels. Force reloading...');
				Navigate.reload();
				return;
			}

			Vue.set(this, 'p_isStreaming', false);
			console.log('Stopped streaming');
		};

		await (becomeBusy ? this.doBusyWork(busyWork) : busyWork());
	}
}
