import { Channel, Presence, Socket } from 'phoenix';
import { markRaw } from 'vue';
import { arrayRemove } from '../../../utils/array';
import type { TabLeader } from '../../../utils/tab-leader';
import { importNoSSR } from '../../../_common/code-splitting';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import {
	ChatClient,
	isInChatRoom,
	leaveChatRoom,
	newChatNotification,
	recollectChatRoomMembers,
	updateChatRoomLastMessageOn,
} from './client';
import { ChatMessage } from './message';
import { ChatNotificationGrowl } from './notification-growl/notification-growl.service';
import { ChatRoom } from './room';
import { ChatUser } from './user';

const TabLeaderLazy = importNoSSR(
	async () => (await import('../../../utils/tab-leader')).TabLeader
);

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

export class ChatUserChannel {
	constructor(public readonly userId: number, public readonly client: ChatClient, params?: any) {
		this.socket = client.socket!;

		this.socketChannel = markRaw(new Channel('user:' + userId, params, this.socket));
		(this.socket as any).channels.push(this.socketChannel);

		this._tabLeader = null;
	}

	readonly socket: Socket;
	readonly socketChannel: Channel;
	private _tabLeader: TabLeader | null;

	init() {
		this._tabLeader = null;
		TabLeaderLazy.then(TabLeader => {
			this._tabLeader = new TabLeader('chat_notification_channel');
			this._tabLeader.init();
		});

		this.setupPresence();

		this.socketChannel.on('friend_updated', this.onFriendUpdated.bind(this));
		this.socketChannel.on('friend_add', this.onFriendAdd.bind(this));
		this.socketChannel.on('friend_remove', this.onFriendRemove.bind(this));
		this.socketChannel.on('notification', this.onNotification.bind(this));
		this.socketChannel.on('you_updated', this.onYouUpdated.bind(this));
		this.socketChannel.on('clear_notifications', this.onClearNotifications.bind(this));
		this.socketChannel.on('group_add', this.onGroupAdd.bind(this));
		this.socketChannel.on('group_leave', this.onRoomLeave.bind(this));
		this.socketChannel.on('update_title', this.onUpdateTitle.bind(this));
		this.socketChannel.onClose(() => {
			if (!this._tabLeader) {
				return;
			}

			this._tabLeader.kill();
		});
	}

	private get isTabLeader() {
		// Assume we are not the tab leader if the lazy import did not resolve yet.
		// Better to have no leader than multiple.
		return this._tabLeader?.isLeader ?? false;
	}

	private setupPresence() {
		const presence = markRaw(new Presence(this.socketChannel));

		presence.onJoin(this.onFriendJoin.bind(this));
		presence.onLeave(this.onFriendLeave.bind(this));
		presence.onSync(() =>
			this.client.friendsList.doBatchWork(() => {
				presence.list((id: string, _presence: UserPresence) => {
					this.client.friendsList.online(+id);
				});
			})
		);
	}

	private onFriendJoin(presenceId: string, currentPresence: UserPresence | undefined) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.client.friendsList.online(userId);
			recollectChatRoomMembers(this.client);
		}
	}

	private onFriendLeave(presenceId: string, currentPresence: UserPresence | undefined) {
		// If the user has left all devices.
		if (currentPresence?.metas.length === 0) {
			const userId = +presenceId;
			this.client.friendsList.offline(userId);
			recollectChatRoomMembers(this.client);
		}
	}

	private onFriendAdd(data: Partial<ChatUser>) {
		const newFriend = new ChatUser(data);
		this.client.friendsList.add(newFriend);
		recollectChatRoomMembers(this.client);
	}

	private onFriendRemove(data: FriendRemovePayload) {
		const userId = data.user_id;
		const friend = this.client.friendsList.get(userId);

		if (friend && isInChatRoom(this.client, friend.room_id)) {
			leaveChatRoom(this.client);
		}

		this.client.friendsList.remove(userId);
		recollectChatRoomMembers(this.client);
	}

	private onFriendUpdated(data: Partial<ChatUser>) {
		const userId = data.id;

		if (userId) {
			const friend = this.client.friendsList.get(userId);
			data.isOnline = friend?.isOnline;
			this.client.friendsList.update(new ChatUser(data));
			recollectChatRoomMembers(this.client);
		}
	}

	private onRoomLeave(data: RoomIdPayload) {
		arrayRemove(this.client.groupRooms, i => i.id === data.room_id);

		if (isInChatRoom(this.client, data.room_id)) {
			leaveChatRoom(this.client, this.client.roomChannels[data.room_id].room);
		}
	}

	private onNotification(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		newChatNotification(this.client, message.room_id);
		updateChatRoomLastMessageOn(this.client, message);
		// Play message received sound, but only on the tab leader.
		let shouldPlay = this.isTabLeader;
		// For client, only play when window is focussed.
		if (GJ_IS_DESKTOP_APP) {
			shouldPlay = ContentFocus.isWindowFocused;
		}
		if (shouldPlay) {
			message.playNotificationSound();
		}

		const room = this.client.groupRooms.find(i => i.id === message.room_id);
		ChatNotificationGrowl.show(this.client, message, room, this.isTabLeader);
	}

	private onYouUpdated(data: Partial<ChatUser>) {
		const newUser = new ChatUser(data);
		this.client.currentUser = newUser;
	}

	private onClearNotifications(data: RoomIdPayload) {
		delete this.client.notifications[data.room_id];
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
