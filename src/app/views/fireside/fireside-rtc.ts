import AgoraRTC, { IAgoraRTCRemoteUser, IRemoteTrack, UID } from 'agora-rtc-sdk-ng';
import { arrayRemove } from '../../../utils/array';

export const FiresideRTCKey = Symbol('fireside-rtc');

export class FiresideRTC {
	agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
	uid: null | UID = null;
	users: FiresideRTCUser[] = [];
	focusedUser: FiresideRTCUser | null = null;

	constructor(private appId: string, private token: string, private channel: string) {
		this.setupEvents();
		this.join();
	}

	public async destroy() {
		await this.agoraClient?.leave();
	}

	private async join() {
		try {
			// We set ourselves up as an audience member with the "low latency"
			// level, instead of the ultra low latency which is used for hosts.
			await this.agoraClient.setClientRole('audience', { level: 1 });
			this.uid = await this.agoraClient.join(this.appId, this.channel, this.token, null);
			this.agoraClient.enableAudioVolumeIndicator();
		} catch (e) {
			console.error(e);
		}
	}

	private setupEvents() {
		this.agoraClient.on('user-joined', (remoteUser) => {
			const user = new FiresideRTCUser(remoteUser);
			this.users.push(user);
			this.focusedUser ??= user;
		});

		this.agoraClient.on('user-left', (remoteUser, _reason) => {
			arrayRemove(this.users, (i) => i.userId === remoteUser.uid);
			// TODO: Unfocus if they were focused for video.
			// TODO: Do the unpublish events still trigger?
		});

		this.agoraClient.on('user-published', async (remoteUser, mediaType) => {
			console.log('got user published');

			const user = this.users.find((i) => i.userId === remoteUser.uid);
			if (!user) {
				console.warn(`couldn't find remote user locally`, remoteUser);
				return;
			}

			if (mediaType === 'video') {
				user.hasVideo = true;
			} else if (mediaType === 'audio') {
				user.hasAudio = true;
				await subscribeTrack(this, user, 'audio');

				// For audio tracks we always immediately play.
				if (mediaType === 'audio') {
					remoteUser.audioTrack?.play();
				}
			}
		});

		this.agoraClient.on('user-unpublished', async (remoteUser, mediaType) => {
			console.log('got user unpublished');

			const user = this.users.find((i) => i.userId === remoteUser.uid);
			if (!user) {
				console.warn(`couldn't find remote user locally`, remoteUser);
				return;
			}

			if (mediaType === 'video') {
				user.hasVideo = false;
				// TODO: Unfocus if they were focused for video.
				// user.videoTrack = null;
				// await this.agoraClient.unsubscribe(remoteUser, 'video');
			} else if (mediaType === 'audio') {
				user.hasAudio = false;
				await unsubscribeTrack(this, user, 'audio');
			}
		});

		this.agoraClient.on('volume-indicator', (items) => {
			for (const { uid, level } of items) {
				const user = this.users.find((i) => i.userId === uid);
				if (user) {
					user.volumeLevel = level;
				}
			}
		});
	}
}

export class FiresideRTCUser {
	public readonly userId: number;
	public readonly tracks: FiresideRTCTrack[] = [];
	public hasAudio = false;
	public hasVideo = false;
	public volumeLevel = 0;

	constructor(public readonly agoraUser: IAgoraRTCRemoteUser) {
		this.userId = agoraUser.uid as number;
	}

	get videoTrack() {
		return this.tracks.find((i) => i.type === 'video');
	}

	get audioTrack() {
		return this.tracks.find((i) => i.type === 'audio');
	}
}

export async function subscribeTrack(
	rtc: FiresideRTC,
	user: FiresideRTCUser,
	mediaType: 'video' | 'audio'
) {
	const track = await rtc.agoraClient.subscribe(user.agoraUser, mediaType);
	user.tracks.push(new FiresideRTCTrack(mediaType, track));
}

export async function unsubscribeTrack(
	rtc: FiresideRTC,
	user: FiresideRTCUser,
	mediaType: 'video' | 'audio'
) {
	await rtc.agoraClient.unsubscribe(user.agoraUser, mediaType);
	arrayRemove(user.tracks, (i) => i.type === mediaType);
}

export class FiresideRTCTrack {
	constructor(
		public readonly type: 'audio' | 'video',
		public readonly agoraTrack: IRemoteTrack
	) {}
}
