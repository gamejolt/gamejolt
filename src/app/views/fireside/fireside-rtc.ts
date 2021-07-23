import AgoraRTC, {
	IAgoraRTCClient,
	IAgoraRTCRemoteUser,
	IRemoteAudioTrack,
	IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { sleep } from '../../../utils/utils';
import { User } from '../../../_common/user/user.model';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	generation = 0;

	videoClient: IAgoraRTCClient | null = null;
	audioClient: IAgoraRTCClient | null = null;
	// uid: null | UID = null;
	users: FiresideRTCUser[] = [];
	focusedUserId: number | null = null;

	constructor(
		private appId: string,
		private videoChannel: string,
		private videoToken: string | null,
		private audioChatChannel: string,
		private audioChatToken: string | null,
		private hosts: User[]
	) {
		this.setup();
	}

	get focusedUser() {
		const user = this.users.find(remoteUser => remoteUser.userId == this.focusedUserId);
		return user?.hasVideo ? user : null;
	}

	private assertNotOutdated(myGeneration: number) {
		if (myGeneration !== this.generation) {
			throw new Error('Outdated generation detected');
		}
	}

	private async setup() {
		console.log('FiresideRTC -> setup');

		this.generation++;
		const currentGen = this.generation;

		this.createClients();
		this.setupEvents();

		for (let i = 0; i < 5; i++) {
			try {
				await this.join();
				break;
			} catch (e) {
				console.error('Failed to join');
				console.error(e);
				await sleep(2000);
				this.assertNotOutdated(currentGen);
				console.log('Retrying...');
			}
		}
	}

	public async destroy() {
		console.log('FiresideRTC -> destroy');

		if (!this.videoClient && !this.audioClient) {
			console.log('Nothing to destroy, video and audio client are unset');
			return;
		}

		try {
			await Promise.all([
				this.videoClient ? this.videoClient.leave() : Promise.resolve(),
				this.audioClient ? this.audioClient.leave() : Promise.resolve(),
			]);
		} catch (e) {
			// reload the page, anything we do now is no longer reliable.
			location.reload();
			return;
		}

		this.videoClient?.removeAllListeners();
		this.audioClient?.removeAllListeners();

		// Unsetting the video and audio clients before stopping playback
		// makes the teardown for rtcuser.stop*playback() functions faster and more reliable
		// since we don't care about unsubscribing after the video/audio clients have left
		// their channels.
		this.videoClient = null;
		this.audioClient = null;

		await Promise.all(
			this.users.map(user =>
				Promise.all([
					user.stopVideoPlayback(this),
					user.stopDesktopAudioPlayback(this),
					user.stopAudioPlayback(this),
				])
			)
		);
	}

	public async recreate() {
		console.log('FiresideRTC -> recreate');
		await this.destroy();
		return this.setup();
	}

	private createClients() {
		console.log('FiresideRTC -> createClients');
		this.videoClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
		this.audioClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
	}

	private setupEvents() {
		console.log('FiresideRTC -> setupEvents');
		const currentGeneration = this.generation;
		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		this.videoClient.on('user-published', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
			console.log('got user published (video channel)');

			const user = this.findOrAddUser(remoteUser);
			if (!user) {
				return;
			}

			user.videoUser = remoteUser;

			// Focusing video user if this is the first video stream we're subscribed to.
			if (mediaType === 'video') {
				user.hasVideo = true;
				this.focusedUserId ??= user.userId;
			} else {
				user.hasDesktopAudio = true;
			}
		});

		this.videoClient.on('user-unpublished', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
			console.log('got user unpublished');

			const user = this.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				console.warn(`couldn't find remote user locally`, remoteUser);
				return;
			}

			if (mediaType === 'video') {
				user.hasVideo = false;
			} else {
				user.hasDesktopAudio = false;
			}
		});

		this.audioClient.on('user-published', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
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

	private async join() {
		console.log('FiresideRTC -> join');
		const currentGeneration = this.generation;

		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		const videoClient = this.videoClient;
		const audioClient = this.audioClient;

		if (!this.videoToken || !this.audioChatToken) {
			console.log('Audience tokens not provided yet. Not attempting to join');
			return;
		}

		// We set ourselves up as an audience member with the "low latency"
		// level, instead of the ultra low latency which is used for hosts.
		await Promise.all([
			this.videoClient.setClientRole('audience', { level: 1 }).then(() => {
				this.assertNotOutdated(currentGeneration);
				return videoClient.join(this.appId, this.videoChannel, this.videoToken, null);
			}),
			this.audioClient.setClientRole('audience', { level: 1 }).then(() => {
				this.assertNotOutdated(currentGeneration);
				return audioClient.join(
					this.appId,
					this.audioChatChannel,
					this.audioChatToken,
					null
				);
			}),
		]);

		// this.videoClient.enableAudioVolumeIndicator();
	}

	public async renewToken(videoToken: string | null, audioChatToken: string | null) {
		console.log('FiresideRTC -> renewToken');

		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		console.log('Renewing audience tokens');
		this.videoToken = videoToken;
		this.audioChatToken = audioChatToken;

		if (!this.videoToken || !this.audioChatToken) {
			console.log('Could not get tokens. The stream likely ended.');
			return;
		}

		const isVideoDisconnected = this.videoClient.connectionState === 'DISCONNECTED';
		const isAudioDisconnected = this.audioClient.connectionState === 'DISCONNECTED';
		// If only one of the clients is fully disconnected, just nuke em both and retry.
		if (isVideoDisconnected !== isAudioDisconnected) {
			console.log(
				'Only one of the clients (video or audio) is connected. Recreating both to get them in sync'
			);
			this.recreate();
			return;
		}

		if (isVideoDisconnected || isAudioDisconnected) {
			console.log('Got new audience tokens. Applying by joining...');
			await this.join();
		} else {
			console.log('Got new audience tokens. Applying by renewing...');
			await Promise.all([
				this.videoClient.renewToken(this.videoToken),
				this.audioClient.renewToken(this.audioChatToken),
			]);
		}
	}

	private findOrAddUser(remoteUser: IAgoraRTCRemoteUser): FiresideRTCUser | null {
		let user = this.users.find(i => i.userId === remoteUser.uid);
		if (!user) {
			if (typeof remoteUser.uid !== 'number') {
				console.warn('Expected remote user uid to be numeric');
				return null;
			}

			user = new FiresideRTCUser(
				remoteUser.uid,
				this.hosts.find(host => host.id == remoteUser.uid)
			);
			this.users.push(user);
		}
		return user;
	}
}

export class FiresideRTCUser {
	public videoUser: IAgoraRTCRemoteUser | null = null;
	public audioChatUser: IAgoraRTCRemoteUser | null = null;
	public hasVideo = false;
	public hasDesktopAudio = false;
	public videoTrack: IRemoteVideoTrack | null = null;
	public desktopAudioTrack: IRemoteAudioTrack | null = null;
	public micAudioTrack: IRemoteAudioTrack | null = null;

	private playerElement: HTMLDivElement | null = null;

	constructor(public readonly userId: number, public readonly userModel: User | undefined) {}

	public async startVideoPlayback(rtc: FiresideRTC, element: HTMLDivElement) {
		console.log(`FiresideRTCUser(${this.userId}) -> startVideoPlayback`);
		if (!this.videoUser || !rtc.videoClient) {
			return;
		}

		console.log('found video user, starting video playback');

		try {
			this.videoTrack = await rtc.videoClient.subscribe(this.videoUser, 'video');
			this.playerElement = element;
			this.videoTrack.play(element);
		} catch (e) {
			console.error('Failed to start video playback, attempting to gracefully stop.');
			console.error(e);

			this.stopVideoPlayback(rtc);
			throw e;
		}
	}

	public async stopVideoPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> stopVideoPlayback`);

		if (!this.videoUser) {
			console.log('no video user, nothing to do');
			return;
		}

		if (this.videoTrack && this.videoTrack.isPlaying) {
			console.log('Stopping existing video track');
			try {
				this.videoTrack.stop();
			} catch (e) {
				console.warn('Failed to stop video track playback');
				console.warn(e);
			}
		}
		this.videoTrack = null;

		if (this.playerElement) {
			this.playerElement.innerHTML = '';
			this.playerElement = null;
		}

		// Don't care if these fail, best effort.
		if (rtc.videoClient) {
			try {
				rtc.videoClient.unsubscribe(this.videoUser, 'video');
			} catch (e) {
				console.error(e);
			}
		}
	}

	public async startDesktopAudioPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> startDesktopAudioPlayback`);
		if (!this.videoUser || !rtc.videoClient) {
			return;
		}

		try {
			this.desktopAudioTrack = await rtc.videoClient.subscribe(this.videoUser, 'audio');
			this.desktopAudioTrack.play();
		} catch (e) {
			console.error('Failed to start desktop audio playback, attempting to gracefully stop.');
			console.error(e);

			this.stopDesktopAudioPlayback(rtc);
			throw e;
		}
	}

	public async stopDesktopAudioPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> stopDesktopAudioPlayback`);
		if (!this.videoUser) {
			return;
		}

		if (this.desktopAudioTrack && this.desktopAudioTrack.isPlaying) {
			console.log('Stopping existing desktop audio track');
			try {
				this.desktopAudioTrack.stop();
			} catch (e) {
				console.warn('Failed to stop desktop audio track playback');
				console.warn(e);
			}
		}
		this.desktopAudioTrack = null;

		if (rtc.videoClient) {
			try {
				rtc.videoClient.unsubscribe(this.videoUser, 'audio');
			} catch (e) {
				console.error(e);
			}
		}
	}

	public async startAudioPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> startAudioPlayback`);
		if (!this.audioChatUser || !rtc.audioClient) {
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
		console.log(`FiresideRTCUser(${this.userId}) -> stopAudioPlayback`);
		if (!this.audioChatUser) {
			return;
		}

		if (this.micAudioTrack && this.micAudioTrack.isPlaying) {
			console.log('Stopping existing audio track');
			try {
				this.micAudioTrack.stop();
			} catch (e) {
				console.warn('Failed to stop mic audio track playback');
				console.warn(e);
			}
		}
		this.micAudioTrack = null;

		// Don't care if these fail, best effort.
		if (rtc.audioClient) {
			try {
				rtc.audioClient.unsubscribe(this.audioChatUser, 'audio');
			} catch (e) {
				console.error(e);
			}
		}
	}
}
