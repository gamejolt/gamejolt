import AgoraRTC, {
	IAgoraRTCClient,
	IAgoraRTCRemoteUser,
	IRemoteAudioTrack,
	IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { sleep } from '../../../utils/utils';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { User } from '../../../_common/user/user.model';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	generation = 0;

	videoClient: IAgoraRTCClient | null = null;
	audioClient: IAgoraRTCClient | null = null;
	// uid: null | UID = null;
	users: FiresideRTCUser[] = [];
	focusedUserId: number | null = null;

	private volumeLevelInterval: NodeJS.Timer | null = null;

	// Avoid using underscore for vue reactivity
	private shouldShowVideoThumbnails = false;

	constructor(
		private userId: number,
		private appId: string,
		private videoChannel: string,
		private videoToken: string | null,
		private audioChatChannel: string,
		private audioChatToken: string | null,
		private hosts: User[]
	) {
		this.setup();
	}

	private log(message: any) {
		console.log('[FIRESIDE-RTC] ' + message);
	}

	private logWarning(message: any) {
		console.warn('[FIRESIDE-RTC] ' + message);
	}

	private logError(message: any) {
		console.error('[FIRESIDE-RTC] ' + message);
	}

	get isHost() {
		return this.hosts.find(host => host.id == this.userId) !== undefined;
	}

	get focusedUser() {
		return this.users.find(remoteUser => remoteUser.userId == this.focusedUserId) || null;
	}

	get thumbnailsVisible() {
		return this.shouldShowVideoThumbnails;
	}

	set thumbnailsVisible(visible: boolean) {
		this.shouldShowVideoThumbnails = visible;
		for (const user of this.users) {
			if (this.focusedUserId === user.userId) {
				continue;
			}

			user.setWantsVideoTrack(this, visible);
		}
	}

	public assertNotOutdated(myGeneration: number) {
		if (myGeneration !== this.generation) {
			throw new Error('Outdated Fireside RTC generation detected');
		}
	}

	private async setup() {
		this.log('Trace(setup)');

		this.generation++;
		const currentGen = this.generation;

		this.createClients();
		this.setupEvents();

		for (let i = 0; i < 5; i++) {
			try {
				await this.join();
				break;
			} catch (e) {
				this.logError('Failed to join');
				this.logError(e);
				await sleep(2000);
				this.assertNotOutdated(currentGen);
				this.log('Retrying...');
			}
		}
	}

	public async destroy() {
		this.log('Trace(destroy)');

		this.generation++;

		try {
			await Promise.all(
				this.users.map(user =>
					Promise.all([
						user.setWantsVideoTrack(this, false),
						user.stopDesktopAudioPlayback(this),
						user.stopAudioPlayback(this),
					])
				)
			);
		} catch (e) {
			this.logWarning('Error while stopping playback. Ignoring.');
			this.logWarning(e);
		}

		try {
			await Promise.all([
				this.videoClient ? this.videoClient.leave() : Promise.resolve(),
				this.audioClient ? this.audioClient.leave() : Promise.resolve(),
			]);
		} catch (e) {
			// reload the page, anything we do now is no longer reliable.
			Navigate.reload();
			return;
		}

		this.videoClient?.removeAllListeners();
		this.audioClient?.removeAllListeners();

		if (this.volumeLevelInterval !== null) {
			clearInterval(this.volumeLevelInterval);
			this.volumeLevelInterval = null;
		}

		this.videoClient = null;
		this.audioClient = null;
		this.focusedUserId = null;
		this.hosts = [];
	}

	public async recreate() {
		this.log('Trace(recreate)');
		await this.destroy();
		return this.setup();
	}

	private createClients() {
		this.log('Trace(createClients)');

		(AgoraRTC as any).setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);

		this.videoClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
		this.audioClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

		this.volumeLevelInterval = setInterval(() => this.updateVolumeLevels(), 100);
	}

	private setupEvents() {
		this.log('Trace(setupEvents)');
		const currentGeneration = this.generation;
		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		this.videoClient.on('user-published', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
			this.log('Got user published (video channel)');

			// To test the lower quality stream
			// this.videoClient!.setRemoteVideoStreamType(remoteUser.uid, 1);

			const user = this.findOrAddUser(remoteUser);
			if (!user) {
				this.logWarning(`Couldn't find remote user locally`);
				this.logWarning(remoteUser);
				return;
			}

			user.videoUser = remoteUser;

			if (mediaType === 'video') {
				user.hasVideo = true;
			} else {
				user.hasDesktopAudio = true;
			}

			this.chooseFocusedUser();

			if (mediaType === 'video') {
				console.log('Current focused user is: ' + this.focusedUserId);
				if (this.focusedUserId === user.userId || this.shouldShowVideoThumbnails) {
					user.setWantsVideoTrack(this, true);
				}
			}
		});

		this.videoClient.on('user-unpublished', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
			this.log('Got user unpublished (video channel)');

			const user = this.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				this.logWarning(`Couldn't find remote user locally`);
				this.logWarning(remoteUser);
				return;
			}

			if (mediaType === 'video') {
				user.setWantsVideoTrack(this, false);
				user.hasVideo = false;
			} else {
				user.hasDesktopAudio = false;
			}

			this.chooseFocusedUser();
		});

		this.videoClient.on('user-left', remoteUser => {
			this.assertNotOutdated(currentGeneration);
			this.log('Got user left (video channel)');

			const user = this.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				this.logWarning(`Couldn't find remote user locally`);
				this.logWarning(remoteUser);
				return;
			}

			// TODO: this will probably error out because it'll fail to "properly" unsubscribe from the track.
			user.setWantsVideoTrack(this, false);

			user.stopDesktopAudioPlayback(this);
			user.videoUser = null;
			user.hasVideo = false;
			user.hasDesktopAudio = false;

			this.removeUserIfNeeded(user);
			this.chooseFocusedUser();
		});

		this.audioClient.on('user-published', async (remoteUser, mediaType) => {
			this.assertNotOutdated(currentGeneration);
			this.log('got user published (audio chat channel)');

			if (mediaType !== 'audio') {
				this.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
				return;
			}

			const user = this.findOrAddUser(remoteUser);
			if (!user) {
				this.logWarning(`Couldn't find remote user locally`);
				this.logWarning(remoteUser);
				return;
			}

			user.audioChatUser = remoteUser;
			user.hasMicAudio = true;
			user.startAudioPlayback(this);

			this.chooseFocusedUser();
		});

		this.audioClient.on('user-left', remoteUser => {
			this.assertNotOutdated(currentGeneration);
			this.log('Got user left (audio channel)');

			const user = this.users.find(i => i.userId === remoteUser.uid);
			if (!user) {
				this.logWarning(`Couldn't find remote user locally`);
				this.logWarning(remoteUser);
				return;
			}

			user.stopAudioPlayback(this);
			user.audioChatUser = null;
			user.hasMicAudio = false;

			this.removeUserIfNeeded(user);
			this.chooseFocusedUser();
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

	private chooseFocusedUser() {
		if (this.focusedUser) {
			return;
		}

		let bestUser: FiresideRTCUser | null = null;
		let bestScore = -1;

		for (const user of this.users) {
			const score =
				(user.hasVideo ? 4 : 0) +
				(user.hasMicAudio ? 2 : 0) +
				(user.hasDesktopAudio ? 1 : 0);
			if (score > bestScore) {
				bestUser = user;
				bestScore = score;
			}
		}

		this.focusedUserId = bestUser?.userId || null;
	}

	private async join() {
		this.log('Trace(join)');
		const currentGeneration = this.generation;

		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		const videoClient = this.videoClient;
		const audioClient = this.audioClient;

		if (!this.videoToken || !this.audioChatToken) {
			this.log('Audience tokens not provided yet. Not attempting to join');
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
		this.log('Trace(renewToken)');

		if (!this.videoClient || !this.audioClient) {
			throw new Error('Video or audio clients are not defined');
		}

		this.log('Renewing audience tokens');
		this.videoToken = videoToken;
		this.audioChatToken = audioChatToken;

		if (!this.videoToken || !this.audioChatToken) {
			this.logWarning('Could not get tokens. The stream likely ended.');
			return;
		}

		const isVideoDisconnected = this.videoClient.connectionState === 'DISCONNECTED';
		const isAudioDisconnected = this.audioClient.connectionState === 'DISCONNECTED';
		// If only one of the clients is fully disconnected, just nuke em both and retry.
		if (isVideoDisconnected !== isAudioDisconnected) {
			this.logError(
				'Only one of the clients (video or audio) is connected. Recreating both to get them in sync'
			);
			this.recreate();
			return;
		}

		if (isVideoDisconnected || isAudioDisconnected) {
			this.log('Got new audience tokens. Applying by joining...');
			await this.join();
		} else {
			this.log('Got new audience tokens. Applying by renewing...');
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
				this.logWarning('Expected remote user uid to be numeric');
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

	private removeUserIfNeeded(user: FiresideRTCUser): void {
		if (!user.videoUser && !user.audioChatUser) {
			this.users = this.users.filter(otherUser => user !== otherUser);
		}
	}

	private updateVolumeLevels() {
		for (const remoteUser of this.users) {
			remoteUser.updateVolumeLevel();
		}
	}
}

export class FiresideRTCUser {
	public videoUser: IAgoraRTCRemoteUser | null = null;
	public audioChatUser: IAgoraRTCRemoteUser | null = null;
	public hasVideo = false;
	public hasDesktopAudio = false;
	public hasMicAudio = false;
	public videoTrack: IRemoteVideoTrack | null = null;
	private wantsVideoTrack = false;
	private isBusyWithVideoTrack = false;
	public desktopAudioTrack: IRemoteAudioTrack | null = null;
	public micAudioTrack: IRemoteAudioTrack | null = null;
	public volumeLevel = 0;

	private videoPlaybackElements: HTMLDivElement[] = [];

	constructor(public readonly userId: number, public readonly userModel: User | undefined) {}

	async setWantsVideoTrack(rtc: FiresideRTC, wantsVideoTrack: boolean) {
		this.wantsVideoTrack = wantsVideoTrack;

		if (this.isBusyWithVideoTrack) {
			console.log('busy');
			return;
		}

		if (!rtc.videoClient) {
			console.warn(
				'Video client is not initialized, cannot toggle video thumbnail subscription state'
			);
			return;
		}

		// If user doesnt have a video stream to subscribe/unsubscribe to, nothing to do.
		if (!this.hasVideo || !this.videoUser) {
			console.log('no video or no video client');
			return;
		}

		// If user is already in the desired state for video subscriptions, noop.
		if (wantsVideoTrack === !!this.videoTrack) {
			console.log('already in desired state');
			return;
		}

		this.isBusyWithVideoTrack = true;

		try {
			if (wantsVideoTrack) {
				try {
					this.videoTrack = await rtc.videoClient.subscribe(this.videoUser, 'video');

					for (const playbackElement of this.videoPlaybackElements) {
						try {
							this.videoTrack.play(playbackElement);
						} catch (e) {
							console.error(
								`Failed to play video track for user ${this.userId} on a playback element ${playbackElement.id}`
							);
							console.error(e);
						}
					}
				} catch (e) {
					console.error(
						'Failed to subscribe to video thumbnails for user ' + this.userId
					);
					console.error(e);
				}
			} else {
				try {
					if (this.videoTrack?.isPlaying) {
						try {
							this.videoTrack.stop();
						} catch (e) {
							console.warn(
								`Got an error while stopping a video track for user ${this.userId}. Tolerating.`
							);
							console.warn(e);
						}
					}

					await rtc.videoClient.unsubscribe(this.videoUser, 'video');

					// TODO: we might want to set the video track to null even before unsubscribing.
					// this is because unsubscribe may fail if we already left the channel or it got disconnected
					// for some reason. in these cases the video track should still get unset, however I don't
					// know what happens if the error is literally with unsubscribing, and the video track remains
					// intact.
					this.videoTrack = null;
				} catch (e) {
					console.error(
						'Failed to subscribe to video thumbnails for user ' + this.userId
					);
					console.error(e);
				}
			}
		} finally {
			this.isBusyWithVideoTrack = false;
		}

		// If the operation's state doesn't match up with our desired state, toggle the thumbnails again.
		if (this.wantsVideoTrack !== wantsVideoTrack) {
			await this.setWantsVideoTrack(rtc, this.wantsVideoTrack);
		}
	}

	public registerVideoPlaybackElement(
		rtc: FiresideRTC,
		element: HTMLDivElement,
		isLowBitrate = false
	) {
		this.videoPlaybackElements.push(element);

		if (this.isBusyWithVideoTrack) {
			return;
		}

		// Wait for next tick before playing so that any video playback elements
		// are first deregistered.
		setTimeout(() => {
			if (this.videoTrack) {
				this.videoTrack.play(element);
				rtc.videoClient!.setRemoteVideoStreamType(this.userId, isLowBitrate ? 1 : 0);
			}
		}, 0);
	}

	public deregisterVideoPlaybackElement(element: HTMLDivElement) {
		this.videoPlaybackElements = this.videoPlaybackElements.filter(
			playbackElement => playbackElement !== element
		);

		element.innerHTML = '';
	}

	// public async startVideoPlayback(rtc: FiresideRTC, element: HTMLDivElement) {
	// 	console.log(`FiresideRTCUser(${this.userId}) -> startVideoPlayback`);
	// 	if (!this.videoUser || !rtc.videoClient) {
	// 		return;
	// 	}

	// 	console.log('found video user, starting video playback');

	// 	try {
	// 		this.videoTrack = await rtc.videoClient.subscribe(this.videoUser, 'video');
	// 		this.playerElement = element;
	// 		this.videoTrack.play(element);
	// 	} catch (e) {
	// 		console.error('Failed to start video playback, attempting to gracefully stop.');
	// 		console.error(e);

	// 		this.stopVideoPlayback(rtc);
	// 		throw e;
	// 	}
	// }

	// public async stopVideoPlayback(rtc: FiresideRTC) {
	// 	console.log(`FiresideRTCUser(${this.userId}) -> stopVideoPlayback`);

	// 	if (!this.videoUser) {
	// 		console.log('no video user, nothing to do');
	// 		return;
	// 	}

	// 	if (this.videoTrack && this.videoTrack.isPlaying) {
	// 		console.log('Stopping existing video track');
	// 		try {
	// 			this.videoTrack.stop();
	// 		} catch (e) {
	// 			console.warn('Failed to stop video track playback');
	// 			console.warn(e);
	// 		}
	// 	}
	// 	this.videoTrack = null;

	// 	if (this.playerElement) {
	// 		this.playerElement.innerHTML = '';
	// 		this.playerElement = null;
	// 	}

	// 	// Don't care if these fail, best effort.
	// 	if (rtc.videoClient) {
	// 		try {
	// 			await rtc.videoClient.unsubscribe(this.videoUser, 'video');
	// 		} catch (e) {
	// 			console.warn(
	// 				'Failed to unsbuscribe to video. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.'
	// 			);
	// 		}
	// 	}
	// }

	public async startDesktopAudioPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> startDesktopAudioPlayback`);
		if (!this.videoUser || !rtc.videoClient) {
			return;
		}

		// if (rtc.isHost) {
		// 	console.log('Aborting desktop audio playback because current user is a host');
		// 	return;
		// }

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
				await rtc.videoClient.unsubscribe(this.videoUser, 'audio');
			} catch (e) {
				console.warn(
					'Failed to unsbuscribe to desktop audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.'
				);
			}
		}
	}

	public async startAudioPlayback(rtc: FiresideRTC) {
		console.log(`FiresideRTCUser(${this.userId}) -> startAudioPlayback`);
		if (!this.audioChatUser || !rtc.audioClient) {
			return;
		}

		// if (rtc.isHost) {
		// 	console.log('Aborting audio playback because current user is a host');
		// 	return;
		// }

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

	public async stopAudioPlayback(rtc: FiresideRTC) {
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
				await rtc.audioClient.unsubscribe(this.audioChatUser, 'audio');
			} catch (e) {
				console.warn(
					'Failed to unsbuscribe to mic audio. Most of the times this is not an error. We attempt to unsubscribe even when we know the user should normally be unsubscribed.'
				);
			}
		}
	}

	public updateVolumeLevel() {
		if (!this.audioChatUser || !this.micAudioTrack || !this.micAudioTrack.isPlaying) {
			this.volumeLevel = 0;
			return;
		}

		this.volumeLevel = this.micAudioTrack.getVolumeLevel();
	}
}
