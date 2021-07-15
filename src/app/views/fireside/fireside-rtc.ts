import AgoraRTC, { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack, UID } from 'agora-rtc-sdk-ng';
import { Api } from '../../../_common/api/api.service';
import { Fireside } from '../../../_common/fireside/fireside.model';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	videoClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
	audioClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
	uid: null | UID = null;
	users: FiresideRTCUser[] = [];
	focusedUser: FiresideRTCUser | null = null;
	renewTokenInterval: NodeJS.Timer | null = null;

	constructor(
		private fireside: Fireside,
		private appId: string,
		private videoChannel: string,
		private videoToken: string | null,
		private audioChatChannel: string,
		private audioChatToken: string | null
	) {
		this.setupEvents();
		this.join();
		this.renewTokenInterval = setInterval(() => this.renewToken(), 60_000);
	}

	public async destroy() {
		console.log('fireside-rtc -> destroy');
		if (this.renewTokenInterval) {
			console.log('fireside-rtc -> clear token interval');
			clearInterval(this.renewTokenInterval);
		}

		await Promise.all([
			this.videoClient?.leave(),
			this.audioClient?.leave(),
		]);
	}

	private async join() {
		console.log('fireside-rtc -> join');
		if (!this.videoToken || !this.audioChatToken) {
			console.log('Audience tokens not provided yet. Not attempting to join');
			return;
		}

		try {
			// We set ourselves up as an audience member with the "low latency"
			// level, instead of the ultra low latency which is used for hosts.
			await Promise.all([
				this.videoClient
					.setClientRole('audience', { level: 1 })
					.then(() => this.videoClient.join(this.appId, this.videoChannel, this.videoToken, null)),
				this.audioClient
					.setClientRole('audience', { level: 1 })
					.then(() => this.audioClient.join(this.appId, this.audioChatChannel, this.audioChatToken, null)),
			]);

			// this.videoClient.enableAudioVolumeIndicator();
		} catch (e) {
			console.error(e);
		}
	}

	private setupEvents() {
		console.log('fireside-rtc -> setup events');
		this.videoClient.on('user-published', async (remoteUser, mediaType) => {
			console.log('got user published (video channel)');

			const user = this.findOrAddUser(remoteUser);
			if (!user) {
				return;
			}

			user.videoUser = remoteUser;

			// Focusing video user if this is the first video stream we're subscribed to.
			if (mediaType === 'video') {
				user.hasVideo = true;
				// this.focusedUser ??= user;
			}
		});

		this.videoClient.on('user-unpublished', async (remoteUser, mediaType) => {
			console.log('got user unpublished');

			const user = this.users.find((i) => i.userId === remoteUser.uid);
			if (!user) {
				console.warn(`couldn't find remote user locally`, remoteUser);
				return;
			}

			if (mediaType === 'video') {
				user.hasVideo = false;
				// TODO: Unfocus if they were focused for video.
			}

			// await user.stopVideoPlayback(this);
		});

		this.audioClient.on('user-published', async (remoteUser, mediaType) => {
			console.log('got user published (audio chat channel)');

			if (mediaType !== 'audio') {
				console.warn('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const user = this.findOrAddUser(remoteUser);
			if (!user) {
				return;
			}

			user.audioChatUser = remoteUser;
			user.startAudioPlayback(this);
		});

		// this.videoClient.on('volume-indicator', (items) => {
		// 	for (const { uid, level } of items) {
		// 		const user = this.users.find((i) => i.userId === uid);
		// 		if (user) {
		// 			user.volumeLevel = level;
		// 		}
		// 	}
		// });
	}

	private async renewToken() {
		console.log('fireside-rtc -> renewToken');
		console.log('Renewing audience tokens');

		if (!this.videoToken || !this.audioChatToken) {
			return;
		}

		const response: {videoToken: string | null, audioChatToken: string | null} = await Api.sendRequest('/web/fireside/fetch-audience-tokens/' + this.fireside.hash);

		this.videoToken = response.videoToken;
		this.audioChatToken = response.audioChatToken;

		if (!this.videoToken || !this.audioChatToken) {
			console.log('Could not get tokens');
			this.destroy();
			return;
		}

		console.log('Got new audience tokens. Applying...');
		await Promise.all([
			this.videoClient.renewToken(this.videoToken),
			this.audioClient.renewToken(this.audioChatToken),
		]);
	}

	private findOrAddUser(remoteUser: IAgoraRTCRemoteUser): FiresideRTCUser | null
	{
		let user = this.users.find((i) => i.userId === remoteUser.uid);
		if (!user) {
			if (typeof remoteUser.uid !== 'number') {
				console.warn('Expected remote user uid to be numeric');
				return null;
			}

			user = new FiresideRTCUser(remoteUser.uid);
			this.users.push(user);
		}
		return user;
	}
}

export class FiresideRTCUser {
	public videoUser: IAgoraRTCRemoteUser | null = null;
	public audioChatUser: IAgoraRTCRemoteUser | null = null;
	public hasVideo = false;
	public videoTrack: IRemoteVideoTrack | null = null;
	public desktopAudioTrack: IRemoteAudioTrack | null = null;
	public micAudioTrack: IRemoteAudioTrack | null = null;

	private playerElement: HTMLDivElement | null = null;

	constructor(public readonly userId: number) {}

	public async startVideoPlayback(rtc: FiresideRTC, element: HTMLDivElement) {
		console.log('fireside-rtc -> start video playback');
		if (!this.videoUser) {
			console.log('no video user, nothing to do');
			return;
		}

		console.log('found video user, starting video playback');

		try {
			const [videoTrack, desktopAudioTrack] = await Promise.all([
				rtc.videoClient.subscribe(this.videoUser, 'video'),
				rtc.videoClient.subscribe(this.videoUser, 'audio'),
			]);

			this.videoTrack = videoTrack;
			this.playerElement = element;
			this.videoTrack.play(element);
			this.desktopAudioTrack = desktopAudioTrack;
			this.desktopAudioTrack.play();
		} catch (e) {
			console.error('Failed to start video playback, attempting to gracefully stop.');
			console.error(e);

			this.stopVideoPlayback(rtc);
			throw e;
		}
	}

	public async stopVideoPlayback(rtc: FiresideRTC) {
		console.log('fireside-rtc -> destroy');

		if (!this.videoUser) {
			console.log('no video user, nothing to do');
			return;
		}

		console.log('found video user, stopping video playback');

		if (this.videoTrack) {
			try {
				this.videoTrack.stop();
			} catch (e) {
				console.warn('Failed to stop video track playback');
				console.warn(e);
			}
		}

		if (this.playerElement) {
			this.playerElement.innerHTML = '';
			this.playerElement = null;
		}

		if (this.desktopAudioTrack) {
			try {
				this.desktopAudioTrack.stop();
			} catch (e) {
				console.warn('Failed to stop desktop audio track playback');
				console.warn(e);
			}
		}

		this.videoTrack = null;
		this.desktopAudioTrack = null;

		// Don't care if these fail, best effort.
		try {
			rtc.videoClient.unsubscribe(this.videoUser, 'video');
		} catch (e) {
			console.error(e);
		}

		try {
			rtc.videoClient.unsubscribe(this.videoUser, 'audio');
		} catch (e) {
			console.error(e);
		}
	}

	public async startAudioPlayback(rtc: FiresideRTC) {
		if (!this.audioChatUser) {
			return;
		}

		try {
			this.micAudioTrack = await rtc.audioClient.subscribe(this.audioChatUser, 'audio');
			this.micAudioTrack.play();
		} catch (e) {
			console.error('Failed to start video playback, attempting to gracefully stop.');
			console.error(e);

			this.stopAudioPlayback(rtc);
			throw e;
		}
	}

	public stopAudioPlayback(rtc: FiresideRTC) {
		if (!this.audioChatUser) {
			return;
		}

		if (this.micAudioTrack) {
			try {
				this.micAudioTrack.stop();
			} catch (e) {
				console.warn('Failed to stop mic audio track playback');
				console.warn(e);
			}
		}

		this.micAudioTrack = null;

		// Don't care if these fail, best effort.
		try {
			rtc.audioClient.unsubscribe(this.audioChatUser, 'audio');
		} catch (e) {
			console.error(e);
		}
	}
}
