import { Channel, Presence, Socket } from 'phoenix';
import { User } from '../../../_common/user/user.model';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

interface UserPresences {
	[key: string]: {
		metas: { phx_ref: string }[];
	};
}

export class UserChannel extends Channel {
	friendsList: ChatUserCollection = null as any;
	currentUser: ChatUser | null = null;
	friendsPopulated = false;

	private socket: Socket;
	private presences!: UserPresences;

	constructor(user: User, socket: Socket, params?: object) {
		super('user:' + user.id, params, socket);
		this.socket = socket;
		(socket as any).channels.push(this);

		this.setupPresence();
	}

	private setupPresence() {
		this.on('presence_state', state => {
			this.presences = Presence.syncState(this.presences, state);
			Object.keys(this.presences).map(presenceId => this.friendsList.online(+presenceId));
		});

		this.on('presence_diff', diff => {
			this.presences = Presence.syncDiff(this.presences, diff);
			Object.keys(this.presences).map(presenceId => this.friendsList.online(+presenceId));
		});

		this.socket.onMessage(
			({ topic, event, payload }: { topic: string; event: string; payload: any }) => {
				if (event === 'presence_diff' && /^user_presence:\d+$/.test(topic)) {
					this.presences = Presence.syncDiff(
						this.presences,
						payload,
						this.onJoin.bind(this),
						this.onLeave.bind(this)
					);
				}
			}
		);
	}

	private onJoin(presenceId: string, currentPresence: any) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.friendsList.online(userId);
		}
	}

	private onLeave(presenceId: string, currentPresence: any) {
		// If the user has left all devices.
		if (currentPresence && currentPresence.metas.length === 0) {
			const userId = +presenceId;
			this.friendsList.offline(userId);
		}
	}
}
