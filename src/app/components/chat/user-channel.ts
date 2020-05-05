import { Channel, Presence, Socket } from 'phoenix';
import { ChatClient } from './client';
import { ChatMessage } from './message';
import { ChatNotification } from './notification/notification.service';
import { ChatUser } from './user';

export class UserChannel extends Channel {
	readonly client: ChatClient;
	readonly socket: Socket;

	constructor(userId: number, client: ChatClient, params?: object) {
		super('user:' + userId, params, client.socket as Socket);
		this.client = client;
		this.socket = client.socket as Socket;
		(this.socket as any).channels.push(this);

		this.setupPresence();

		this.on('friend_updated', this.onFriendUpdated.bind(this));
		this.on('friend_add', this.onFriendAdd.bind(this));
		this.on('friend_remove', this.onFriendRemove.bind(this));
		this.on('notification', this.onNotification.bind(this));
		this.on('you_updated', this.onYouUpdated.bind(this));
	}

	private setupPresence() {
		const presence = new Presence(this);

		presence.onJoin(this.onFriendJoin.bind(this));
		presence.onLeave(this.onFriendLeave.bind(this));
		presence.onSync(() =>
			presence.list((id, _user) => {
				this.client.friendsList.online(+id);
			})
		);
	}

	private onFriendJoin(presenceId: string, currentPresence: any) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.client.friendsList.online(userId);
		}
	}

	private onFriendLeave(presenceId: string, currentPresence: any) {
		// If the user has left all devices.
		if (currentPresence && currentPresence.metas.length === 0) {
			const userId = +presenceId;
			this.client.friendsList.offline(userId);
		}
	}

	private onFriendAdd(data: Partial<ChatUser>) {
		this.client.friendsList.add(new ChatUser(data));
	}

	private onFriendRemove(data: { user_id: number }) {
		const userId = data.user_id;
		const friend = this.client.friendsList.get(userId);

		if (friend && this.client.isInRoom(friend.roomId)) {
			this.client.leaveRoom();
		}

		this.client.friendsList.remove(userId);
	}

	private onFriendUpdated(data: Partial<ChatUser>) {
		const userId = data.id;

		if (userId) {
			const friend = this.client.friendsList.get(userId);
			data.isOnline = friend?.isOnline;
			this.client.friendsList.update(new ChatUser(data));
		}
	}

	private onNotification(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		this.client.newNotification(message.roomId);

		const friend = this.client.friendsList.getByRoom(message.roomId);
		if (friend) {
			friend.lastMessageOn = message.loggedOn.getTime();
			console.log('Updated friend timestamp to ' + friend.lastMessageOn);
			this.client.friendsList.update(friend);
		}

		ChatNotification.notification(message);
	}

	private onYouUpdated(data: Partial<ChatUser>) {
		const newUser = new ChatUser(data);
		this.client.currentUser = newUser;
	}
}
