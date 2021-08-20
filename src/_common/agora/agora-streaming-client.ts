import AgoraRTC, {
	ClientRole,
	IAgoraRTCClient,
	IAgoraRTCRemoteUser,
	ILocalAudioTrack,
	ILocalTrack,
	ILocalVideoTrack,
	NetworkQuality,
	UID,
} from 'agora-rtc-sdk-ng';
import Vue from 'vue';

export class AgoraStreamingClient {
	private readonly appId!: string;
	public readonly name!: string;
	public channel: string | null;
	public token: string | null;
	public userId: number | null;

	private videoDeviceId: string | null;
	private audioInputDeviceId: string | null;
	private audioVirtualInputDeviceId: string | null;
	private audioOutputDeviceId: string | null;

	private client: IAgoraRTCClient = null as any;
	private role: ClientRole;
	private audioPlaybackEnabled: boolean;
	public isStreaming: boolean;
	private p_networkQuality: NetworkQuality | null = null;
	private poorNetworkQualitySince: number | null;

	private localVideoTrack: ILocalVideoTrack | null = null;
	private localAudioInputTrack: ILocalAudioTrack | null = null;
	private localAudioVirtualInputTrack: ILocalAudioTrack | null = null;

	private _onUserPublishedListener!: (
		user: IAgoraRTCRemoteUser,
		mediaType: 'audio' | 'video'
	) => void;
	public onDisposed?: () => void;
	private p_isDisposed!: boolean;

	public onGibToken?: () => void;
	private _gibTokenListener!: () => void;
	private _tokenExpiredListener!: () => void;
	private _exceptionListener!: (event: { err: number; msg: string; uid: UID }) => void;
	private _networkQualityListener!: (stats: NetworkQuality) => void;

	constructor(appId: string, name: string) {
		this.appId = appId;
		this.name = name;
		this.channel = null;
		this.token = null;
		this.userId = null;

		this.videoDeviceId = null;
		this.audioInputDeviceId = null;
		this.audioVirtualInputDeviceId = null;
		this.audioOutputDeviceId = null;

		Vue.set(this, 'p_networkQuality', null);
		this.poorNetworkQualitySince = null;

		(AgoraRTC as any).setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 50);

		this.client = AgoraRTC.createClient({
			mode: 'live',
			codec: 'h264',
		});

		this.role = 'audience';
		this.client.setClientRole(this.role, { level: 1 });

		this.audioPlaybackEnabled = false;
		this._onUserPublishedListener = async (remoteUser, mediaType) => {
			this.assertNotDisposed();

			this.log(
				'Got user published event (channel: ' +
					this.channel +
					', uid: ' +
					remoteUser.uid +
					', mediaType: ' +
					mediaType +
					')'
			);
			if (!this.audioPlaybackEnabled || mediaType !== 'audio') {
				this.log('Audio playback is disabled, not playing back');
				return;
			}

			this.log('Got audio stream from user ' + remoteUser.uid);
			await this.client.subscribe(remoteUser, 'audio');
			this.log('Subscribed to output');

			await this.updateRemoteUserPlaybackDevice(remoteUser);
			this.assertNotDisposed();

			this.log('Playing audio stream from user ' + remoteUser.uid);
			const audioTrack = remoteUser.audioTrack;
			if (!audioTrack) {
				this.warn(
					'User audio track is no longer defined. This may indicate an issue but could also happen when a client disconnects'
				);
				return;
			}

			remoteUser.audioTrack?.getMediaStreamTrack();

			if (this.audioOutputDeviceId !== null) {
				remoteUser.audioTrack!.play();
			}
		};
		this.client.on('user-published', this._onUserPublishedListener);

		this._gibTokenListener = () => {
			console.log('token will expire');
			this.assertNotDisposed();

			if (this.onGibToken) {
				this.onGibToken();
			}
		};
		this._tokenExpiredListener = () => {
			console.log('token expired');
			this.assertNotDisposed();

			if (this.onGibToken) {
				this.onGibToken();
			}
		};
		this.client.on('token-privilege-will-expire', this._gibTokenListener);
		this.client.on('token-privilege-did-expire', this._tokenExpiredListener);

		this._exceptionListener = (event: { err: number; msg: string; uid: UID }) => {
			this.assertNotDisposed();

			this.warn(`Got error (err: ${event.err}, uid: ${event.uid}): ${event.msg}`);
		};
		this.client.on('exception', this._exceptionListener);

		this._networkQualityListener = (stats: NetworkQuality) => {
			// Ignore network quality messages while not streaming because why the hell is this even fired?
			// We only want to act on bad network connections if we intend to be streaming.
			if (!this.isStreaming) {
				return;
			}

			Vue.set(this, 'p_networkQuality', stats);
			if (this.isPoorNetworkQuality) {
				if (this.poorNetworkQualitySince === null) {
					this.poorNetworkQualitySince = Date.now();
				}

				// If the network conditions have been poor for too long,
				// it is likely that we cannot properly reconnect to agora.
				// Seems like this happens when the tokens expired while being offline.
				if (Date.now() - this.poorNetworkQualitySince > 30_000) {
					this.error('Network quality has been poor for too long.');
					this.dispose();
				}
			} else {
				this.poorNetworkQualitySince = null;
			}
		};
		this.client.on('network-quality', this._networkQualityListener);

		this.isStreaming = false;
		Vue.set(this, 'p_isDisposed', false);
	}

	get isPoorNetworkQuality() {
		// Indeterminate doesnt mean poor network quality.
		if (this.p_networkQuality === null) {
			return false;
		}

		return (
			this.p_networkQuality.downlinkNetworkQuality >= 4 ||
			this.p_networkQuality.uplinkNetworkQuality >= 4
		);
	}

	get isDisposed() {
		return this.p_isDisposed;
	}

	private log(msg: any) {
		console.log(`[web-client ${this.name}] ${msg}`);
	}

	private warn(msg: any) {
		console.warn(`[web-client ${this.name}] ${msg}`);
	}

	private error(msg: any) {
		console.error(`[web-client ${this.name}] ${msg}`);
	}

	private assertNotDisposed() {
		if (this.p_isDisposed) {
			throw new Error("Can't do that, the client is already disposed");
		}
	}

	public async joinChannel(channel: string, token: string, userId: number) {
		this.assertNotDisposed();

		this.channel = channel;
		this.token = token;
		this.userId = userId;

		// Seems to be unreliable.
		// if (this.client.connectionState !== 'DISCONNECTED') {
		// 	throw new Error(
		// 		`Attempted to joinChannel, but client's connection state is ${this.client.connectionState}`
		// 	);
		// }

		try {
			this.poorNetworkQualitySince = null;

			this.log('Joining channel ' + this.channel);
			const uid = await this.client.join(this.appId, this.channel, this.token, this.userId);

			if (uid !== this.userId) {
				throw new Error('Expected uid to be ' + this.userId + ', but got: ' + uid);
			}
			this.assertNotDisposed();

			// Switch to host role.
			this.log('Switching to host role');
			await this.client.setClientRole('host');
			this.assertNotDisposed();

			this.log('Enabling dual stream mode');
			// Sometimes this fails if the client is already supposedly enabled, but we
			// don't have any way of knowing why this failed.. so we try to disable and reenable.
			try {
				await this.client.enableDualStream();
			} catch (e) {
				console.warn(e);
				this.assertNotDisposed();
				await this.client.disableDualStream();
				this.assertNotDisposed();
				await this.client.enableDualStream();
			}
			this.assertNotDisposed();

			await this.client.setLowStreamParameter({
				width: 128,
				height: 72,
				framerate: 10,
				bitrate: 350,
			});
			this.assertNotDisposed();

			this.log(`Joined channel (uid: ${uid})`);
		} catch (e) {
			this.error('Failed to join channel');
			console.error(e);

			this.dispose();
			throw new Error('Failed to join channel: ' + e.message);
		}
	}

	public async leaveChannel() {
		this.assertNotDisposed();

		this.channel = null;
		this.token = null;
		this.userId = null;

		const connectionState = this.client.connectionState;
		if (connectionState === 'DISCONNECTED') {
			// Degraded this to a a noop.
			// throw new Error(
			// 	`Attempted to leaveChannel, but client's connection state is ${connectionState}`
			// );
			return;
		}

		this.log('Leaving channel ' + this.channel);
		try {
			await this.client.leave();
			this.log(`Left channel`);
		} catch (e) {
			this.error('Failed to leave channel');
			console.error(e);

			this.dispose();
		}
	}

	public async setToken(newToken: string) {
		this.assertNotDisposed();

		if (!this.isStreaming) {
			this.log('Aborting set token because client is not streaming');
			return;
		}

		this.log('Setting new token');
		this.token = newToken;

		// TODO: check if this works in cases of reconnections or after manually stopping and starting again.
		if (!this.client.channelName) {
			if (!this.channel || !this.userId) {
				throw new Error('Expected channel and userId to be set at this point');
			}

			this.log('Client was fully disconnected. Need to rejoin channel');
			await this.joinChannel(this.channel, this.token, this.userId);
		} else {
			this.log('Client was connected. Renewing token');
			await this.client.renewToken(newToken);
		}

		// Old way of doing things seems unreliable..
		// Even when you call renewToken while reconnecting, agora still claims
		// the token is expired, even tho it definitely isn't.
		// Not sure why at the moment. Hoping the new way with monitoring the
		// existance of channelName is better.
		//
		// const connectionState = this.client.connectionState;
		// switch (connectionState) {
		// 	case 'DISCONNECTED': {
		// 		if (!this.channel || !this.userId) {
		// 			throw new Error('Expected channel and userId to be set at this point');
		// 		}

		// 		// TODO: might need to explicitly leave the channel first
		// 		this.log('Client was fully disconnected. Need to rejoin channel');
		// 		await this.joinChannel(this.channel, this.token, this.userId);
		// 		break;
		// 	}

		// 	case 'CONNECTED':
		// 	case 'CONNECTING':
		// 	case 'RECONNECTING': {
		// 		this.log('Client was connected. Renewing token');
		// 		this.client.renewToken(newToken);
		// 		break;
		// 	}
		// }
	}

	private async getVideoTrack() {
		this.assertNotDisposed();

		if (!this.videoDeviceId) {
			return null;
		}

		const track = await AgoraRTC.createCameraVideoTrack({
			cameraId: this.videoDeviceId,
			optimizationMode: 'motion',
			encoderConfig: {
				bitrateMax: 5000,
				width: { max: 1280 },
				height: { max: 720 },
				frameRate: { max: 30 },
			},
		});

		this.log('Video webcam track id: ' + track.getTrackId());
		return track;
	}

	private async getVirtualMicTrack() {
		this.assertNotDisposed();

		if (!this.audioVirtualInputDeviceId) {
			return null;
		}

		const track = await AgoraRTC.createMicrophoneAudioTrack({
			microphoneId: this.audioVirtualInputDeviceId,
			AEC: false,
			AGC: false,
			ANS: false,
		});
		track.setVolume(100);

		this.log('Virtual mic track id: ' + track.getTrackId());
		return track;
	}

	private async getMicTrack() {
		this.assertNotDisposed();

		if (!this.audioInputDeviceId) {
			return null;
		}

		const track = await AgoraRTC.createMicrophoneAudioTrack({
			microphoneId: this.audioInputDeviceId,
		});
		track.setVolume(100);

		this.log('Mic track id: ' + track.getTrackId());
		return track;
	}

	private isTrackPublished(track: ILocalTrack) {
		this.assertNotDisposed();

		return (
			this.client.localTracks.find(
				publishedTrack => publishedTrack.getTrackId() === track.getTrackId()
			) !== undefined
		);
	}

	public async setVideoDevice(deviceId: string | null) {
		this.assertNotDisposed();

		this.videoDeviceId = deviceId;

		this.log('Setting video device to ' + deviceId);

		if (this.localVideoTrack !== null) {
			this.log('Local video track already exists.');

			const localVideoTrack = this.localVideoTrack;
			this.localVideoTrack = null;

			const isPublished = this.isTrackPublished(localVideoTrack);
			if (isPublished) {
				this.log('Local video is already published. Unpublishing first.');
				await this.client.unpublish(localVideoTrack);
				this.assertNotDisposed();
			}

			this.log('Closing previous local video track');
			localVideoTrack.close();
		}

		this.log('Getting new video track');
		this.localVideoTrack = await this.getVideoTrack();
		this.assertNotDisposed();

		// Only publish if we are streaming
		if (this.localVideoTrack !== null && this.isStreaming) {
			this.log('Publishing new video track');
			await this.client.publish(this.localVideoTrack);
		}
	}

	public async setVirtualMicDevice(deviceId: string | null) {
		this.assertNotDisposed();

		this.audioVirtualInputDeviceId = deviceId;
		this.log('Setting virtual mic device to ' + deviceId);

		if (this.localAudioVirtualInputTrack !== null) {
			this.log('Local virtual mic track already exists.');

			const localAudioVirtualInputTrack = this.localAudioVirtualInputTrack;
			this.localAudioVirtualInputTrack = null;

			const isPublished = this.isTrackPublished(localAudioVirtualInputTrack);
			if (isPublished) {
				this.log('Local virtual audio mic track is already published. Unpublishing.');
				await this.client.unpublish(localAudioVirtualInputTrack);
				this.assertNotDisposed();
			}

			this.log('Closing previous local virtual audio mic track');
			localAudioVirtualInputTrack.close();
		}

		this.log('Getting new virtual mic track');
		this.localAudioVirtualInputTrack = await this.getVirtualMicTrack();
		this.assertNotDisposed();

		// Only publish if we are streaming
		if (this.localAudioVirtualInputTrack !== null && this.isStreaming) {
			this.log('Publishing new virtual mic track');
			await this.client.publish(this.localAudioVirtualInputTrack);
		}
	}

	public async setMicDevice(deviceId: string | null) {
		this.assertNotDisposed();

		this.audioInputDeviceId = deviceId;
		this.log('Setting mic device to ' + deviceId);

		if (this.localAudioInputTrack !== null) {
			this.log('Local mic track already exists.');

			const localAudioInputTrack = this.localAudioInputTrack;
			this.localAudioInputTrack = null;

			const isPublished = this.isTrackPublished(localAudioInputTrack);
			if (isPublished) {
				this.log('Local mic track is already published. Unpublishing');
				await this.client.unpublish(localAudioInputTrack);
				this.assertNotDisposed();
			}

			this.log('Closing previous local mic track');
			localAudioInputTrack.close();
		}

		this.log('Getting new mic track');
		this.localAudioInputTrack = await this.getMicTrack();
		this.assertNotDisposed();

		// Only publish if we are streaming
		if (this.localAudioInputTrack !== null && this.isStreaming) {
			this.log('Publishing new mic track');
			await this.client.publish(this.localAudioInputTrack);
		}
	}

	public async setSpeakerDevice(deviceId: string | null) {
		this.assertNotDisposed();

		const oldOutputDeviceId = this.audioOutputDeviceId;
		this.audioOutputDeviceId = deviceId;

		this.log('Setting speaker device to ' + (deviceId ?? 'null'));

		if (!this.audioPlaybackEnabled) {
			this.log('Audio playback is not enabled, nothing to do');
			return;
		}

		this.log('Applying new audio playback device to all remote audio streams');

		await Promise.all(
			this.client.remoteUsers.map(remoteUser => {
				const audioTrack = remoteUser.audioTrack;
				if (!audioTrack) {
					this.log('- no audio track for user ' + remoteUser.uid);
					return;
				}

				if (!oldOutputDeviceId && this.audioOutputDeviceId) {
					audioTrack.play();
				} else if (oldOutputDeviceId && !this.audioOutputDeviceId) {
					audioTrack.stop();
				}

				return this.updateRemoteUserPlaybackDevice(remoteUser);
			})
		);
	}

	public previewVideo(element: HTMLDivElement) {
		element.innerHTML = '';
		this.localVideoTrack?.play(element, {
			fit: 'contain',
			mirror: false,
		});
	}

	public getVirtualAudioInputVolume() {
		// if (!this.localAudioVirtualInputTrack) {
		// 	return 0;
		// }

		// const source = (this.localAudioVirtualInputTrack as any)._source;
		// return source.getAccurateVolumeLevel();

		return this.localAudioVirtualInputTrack?.getVolumeLevel() || 0;
	}

	public getAudioInputVolume() {
		return this.localAudioInputTrack?.getVolumeLevel() || 0;
	}

	public async enableAudioPlayback() {
		this.assertNotDisposed();

		this.audioPlaybackEnabled = true;
		this.log('Enabled audio playback');
	}

	private updateRemoteUserPlaybackDevice(remoteUser: IAgoraRTCRemoteUser) {
		const audioTrack = remoteUser.audioTrack;
		if (!audioTrack) {
			this.log('- no audio track for user ' + remoteUser.uid);
			return;
		}

		if (this.audioOutputDeviceId !== null) {
			this.log('- applying new audio track for user ' + remoteUser.uid);
			return audioTrack.setPlaybackDevice(this.audioOutputDeviceId);
		}
	}

	async startVideoStream() {
		this.assertNotDisposed();

		if (this.channel === null || this.token === null || this.userId === null) {
			throw new Error('Must join before starting a stream');
		}

		this.log('Starting video stream');
		this.isStreaming = true;

		this.log('Setting client role to host');
		this.role = 'host';
		await this.client.setClientRole(this.role);
		this.assertNotDisposed();

		const publishableTracks = [this.localVideoTrack, this.localAudioVirtualInputTrack].filter(
			track => track !== null
		) as ILocalTrack[];

		if (publishableTracks.length > 0) {
			this.log('Got local desktop video and audio track. Publishing.');
			await this.client.publish(publishableTracks);
			this.assertNotDisposed();
		}

		this.log('Started streaming');
	}

	async startChatStream() {
		this.assertNotDisposed();

		if (this.channel === null || this.token === null || this.userId === null) {
			throw new Error('Must join before starting a stream');
		}

		this.log('Starting chat stream');
		this.isStreaming = true;

		this.log('Setting client role to host');
		this.role = 'host';
		await this.client.setClientRole(this.role);
		this.assertNotDisposed();

		if (this.localAudioInputTrack !== null) {
			this.log('Got local desktop video and audio track. Publishing.');
			await this.client.publish(this.localAudioInputTrack);
			this.assertNotDisposed();
		}

		this.log('Started streaming');
	}

	async stopStream() {
		this.assertNotDisposed();

		this.log('Stopping stream');
		this.isStreaming = false;

		this.log('Stopping audio playback for all remote audio streams');
		this.audioPlaybackEnabled = false;
		this.client.remoteUsers.map(remoteUser => {
			const audioTrack = remoteUser.audioTrack;
			if (!audioTrack) {
				this.log('- no audio track for user ' + remoteUser.uid);
				return;
			}

			this.log('- stopping audio track for user ' + remoteUser.uid);
			audioTrack.stop();
		});

		const tracksToUnpublish = [
			this.localVideoTrack!,
			this.localAudioVirtualInputTrack!,
			this.localAudioInputTrack!,
		].filter(track => track !== null && this.isTrackPublished(track));

		if (tracksToUnpublish.length > 0) {
			this.log(
				'Unpublishing local tracks (' +
					tracksToUnpublish.map(track => track.getTrackId()) +
					')'
			);
			await this.client.unpublish(tracksToUnpublish);
			this.assertNotDisposed();

			// No need to close local tracks when stopping the stream.
			// We don't reinstantiate them when starting the stream again, only when switching devices.
			//
			// this.log('Closing local tracks');
			// for (const track of tracksToUnpublish) {
			// 	track.close();
			// }

			// this.localVideoTrack = null;
			// this.localAudioVirtualInputTrack = null;
			// this.localAudioInputTrack = null;

			this.log('Setting client role back to audience');
			this.role = 'audience';
			await this.client.setClientRole(this.role, { level: 1 });
			this.assertNotDisposed();
		}

		this.log('Stopped streaming');
	}

	public async dispose() {
		if (this.p_isDisposed) {
			console.warn(new Error('Attempted to dispose while already disposing the client'));
			return;
		}

		this.log('Disposing of client');
		Vue.set(this, 'p_isDisposed', true);
		this.isStreaming = false;

		this.client.off('user-published', this._onUserPublishedListener);
		this.client.off('token-privilege-will-expire', this._gibTokenListener);
		this.client.off('token-privilege-did-expire', this._tokenExpiredListener);
		this.client.off('exception', this._exceptionListener);
		this.client.off('network-quality', this._networkQualityListener);

		// After the client leaves close the local tracks so we can reuse the devices.
		// Do this even if the client failed to leave the channel.
		try {
			await this.client.leave();
		} catch (e) {
			// don't care if this fails, do best effort
			this.warn('Failed to leave client while disposing');
			console.warn(e);
		}

		for (const localTrack of [
			this.localVideoTrack,
			this.localAudioVirtualInputTrack,
			this.localAudioInputTrack,
		]) {
			if (localTrack === null) {
				continue;
			}

			try {
				localTrack.close();
			} catch (e) {
				this.warn('Failed to close local track while disposing');
				console.warn(e);
			}
		}

		if (this.onDisposed) {
			this.onDisposed();
		}
	}
}
