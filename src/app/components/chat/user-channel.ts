import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { arrayRemove } from '../../../utils/array';
import { TabLeader } from '../../../utils/tab-leader';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import {
	ChatClient,
	isInChatRoom,
	leaveChatRoom,
	newChatNotification,
	updateChatRoomLastMessageOn,
} from './client';
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

interface UpdateGroupTitlePayload {
	title: string;
	room_id: number;
}

export class ChatUserChannel extends Channel {
	readonly client: ChatClient;
	readonly socket: Socket;
	readonly tabLeader: TabLeader;

	constructor(userId: number, client: ChatClient, params?: any) {
		super('user:' + userId, params, client.socket as Socket);
		this.client = client;
		this.socket = client.socket as Socket;
		(this.socket as any).channels.push(this);
		this.tabLeader = new TabLeader('chat_notification_channel');
		this.tabLeader.init();

		this.setupPresence();

		this.on('friend_updated', this.onFriendUpdated.bind(this));
		this.on('friend_add', this.onFriendAdd.bind(this));
		this.on('friend_remove', this.onFriendRemove.bind(this));
		this.on('notification', this.onNotification.bind(this));
		this.on('you_updated', this.onYouUpdated.bind(this));
		this.on('clear_notifications', this.onClearNotifications.bind(this));
		this.on('group_add', this.onGroupAdd.bind(this));
		this.on('group_leave', this.onRoomLeave.bind(this));
		this.on('update_title', this.onUpdateTitle.bind(this));
		this.onClose(() => {
			this.tabLeader.kill();
		});
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
		arrayRemove(this.client.groupRooms, i => i.id === data.room_id);
	}

	private onNotification(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		newChatNotification(this.client, message.room_id);
		updateChatRoomLastMessageOn(this.client, message);
		// Play message received sound, but only on the tab leader.
		let shouldPlay = this.tabLeader.isLeader;
		// For client, only play when window is focussed.
		if (GJ_IS_CLIENT) {
			shouldPlay = ContentFocus.isWindowFocused;
		}
		if (shouldPlay) {
			message.playNotificationSound();
		}

		const room = this.client.groupRooms.find(i => i.id === message.room_id);
		ChatNotificationGrowl.show(this.client, message, room, this.tabLeader.isLeader);
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

	private onUpdateTitle(data: UpdateGroupTitlePayload) {
		const index = this.client.groupRooms.findIndex(room => room.id === data.room_id);

		if (index !== -1) {
			this.client.groupRooms[index].title = data.title;
		}
	}
}
