import { BroadcastChannel, createLeaderElection, LeaderElector } from 'broadcast-channel';
import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { ChatClient, isInChatRoom, leaveChatRoom, newChatNotification } from './client';
import { ChatMessage } from './message';
import { ChatNotificationGrowl } from './notification-growl/notification-growl.service';
import { ChatRoom } from './room';
import { ChatUser } from './user';

interface UserPresence {
	metas: { phx_ref: string }[];
}

interface FriendRemovePayload {
	user_id: number;
}

interface GroupAddPayload {
	room: Partial<ChatRoom>;
}

interface RoomIdPayload {
	room_id: number;
}

export class ChatUserChannel extends Channel {
	readonly client: ChatClient;
	readonly socket: Socket;

	private readonly notificationChannel: BroadcastChannel;
	private readonly elector: LeaderElector;

	constructor(userId: number, client: ChatClient, params?: any) {
		super('user:' + userId, params, client.socket as Socket);
		this.client = client;
		this.socket = client.socket as Socket;
		(this.socket as any).channels.push(this);
		this.notificationChannel = new BroadcastChannel('notification_channel');
		this.elector = createLeaderElection(this.notificationChannel);
		this.initLeader();

		this.setupPresence();

		this.on('friend_updated', this.onFriendUpdated.bind(this));
		this.on('friend_add', this.onFriendAdd.bind(this));
		this.on('friend_remove', this.onFriendRemove.bind(this));
		this.on('notification', this.onNotification.bind(this));
		this.on('you_updated', this.onYouUpdated.bind(this));
		this.on('clear_notifications', this.onClearNotifications.bind(this));
		this.on('group_add', this.onGroupAdd.bind(this));
		this.on('group_leave', this.onRoomLeave.bind(this));
		this.onClose(() => {
			this.notificationChannel.close();
			this.elector.die();
		});
	}

	private initLeader() {
		// This function begins the process of attemping to become the leader.
		// All tabs need this process to be active. This promise will resolve if
		// this tab ever becomes the leader. It should fail if the tab loses
		// leadership. When that happens we want to try just to become leader
		// again.
		this.elector.awaitLeadership().catch(() => this.initLeader());
	}

	private setupPresence() {
		const presence = new Presence(this);

		presence.onJoin(this.onFriendJoin.bind(this));
		presence.onLeave(this.onFriendLeave.bind(this));
		presence.onSync(() =>
			presence.list((id: string, _presence: UserPresence) => {
				this.client.friendsList.online(+id);
			})
		);
	}

	private onFriendJoin(presenceId: string, currentPresence: UserPresence | undefined) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.client.friendsList.online(userId);
		}
	}

	private onFriendLeave(presenceId: string, currentPresence: UserPresence | undefined) {
		// If the user has left all devices.
		if (currentPresence && currentPresence.metas.length === 0) {
			const userId = +presenceId;
			this.client.friendsList.offline(userId);
		}
	}

	private onFriendAdd(data: Partial<ChatUser>) {
		const newFriend = new ChatUser(data);
		this.client.friendsList.add(newFriend);
	}

	private onFriendRemove(data: FriendRemovePayload) {
		const userId = data.user_id;
		const friend = this.client.friendsList.get(userId);

		if (friend && isInChatRoom(this.client, friend.room_id)) {
			leaveChatRoom(this.client);
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

	private onRoomLeave(data: RoomIdPayload) {
		const index = this.client.groupRooms.findIndex(room => room.id === data.room_id);
		if (index !== -1) {
			this.client.groupRooms.splice(index, 1);
		}
	}

	private onNotification(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		newChatNotification(this.client, message.room_id);

		const friend = this.client.friendsList.getByRoom(message.room_id);
		if (friend) {
			friend.last_message_on = message.logged_on.getTime();
			this.client.friendsList.update(friend);
		}

		ChatNotificationGrowl.show(this.client, message, this.elector.isLeader);
	}

	private onYouUpdated(data: Partial<ChatUser>) {
		const newUser = new ChatUser(data);
		this.client.currentUser = newUser;
	}

	private onClearNotifications(data: RoomIdPayload) {
		Vue.delete(this.client.notifications, '' + data.room_id);
	}

	private onGroupAdd(data: GroupAddPayload) {
		const newGroup = new ChatRoom(data.room);
		this.client.groupRooms.push(newGroup);
	}
}
