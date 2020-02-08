import { Channel, Presence, Socket } from 'phoenix';
import { User } from '../../../_common/user/user.model';
import { ChatUserCollection } from './user-collection';

export class UserChannel extends Channel {
	friendsList: ChatUserCollection = null as any;

	private socket: Socket;
	private friendPresences = {};

	constructor(user: User, socket: Socket, params?: object) {
		super('user:' + user.id, params, socket);
		this.socket = socket;
		(socket as any).channels.push(this);

		this.setupPresence();
	}

	private mapFriendPresences() {
		Object.keys(this.friendPresences).map(presenceId => this.friendsList.online(+presenceId));
	}

	private setupPresence() {
		this.on('presence_state', state => {
			this.friendPresences = Presence.syncState(this.friendPresences, state);
			this.mapFriendPresences();
		});

		this.on('presence_diff', diff => {
			this.friendPresences = Presence.syncDiff(this.friendPresences, diff);
			this.mapFriendPresences();
		});

		this.socket.onMessage(
			({ topic, event, payload }: { topic: string; event: string; payload: any }) => {
				if (event === 'presence_diff' && /^user_presence:\d+$/.test(topic)) {
					this.friendPresences = Presence.syncDiff(
						this.friendPresences,
						payload,
						this.onFriendJoin.bind(this),
						this.onFriendLeave.bind(this)
					);
				}
			}
		);
	}

	private onFriendJoin(presenceId: string, currentPresence: any) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.friendsList.online(userId);
		}
	}

	private onFriendLeave(presenceId: string, currentPresence: any) {
		// If the user has left all devices.
		if (currentPresence && currentPresence.metas.length === 0) {
			const userId = +presenceId;
			this.friendsList.offline(userId);
		}
	}
}
