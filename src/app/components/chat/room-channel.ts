import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { arrayRemove } from '../../../utils/array';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { ChatClient, isInChatRoom, processNewChatOutput, setChatRoom } from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

interface RoomPresence {
	metas: { phx_ref: string; typing: boolean }[];
	user: ChatUser;
}

interface ClearNotificationsPayload {
	room_id: number;
}

export class ChatRoomChannel extends Channel {
	room!: ChatRoom;
	typing!: ChatUser[];
	roomId: number;
	readonly client: ChatClient;
	readonly socket: Socket;

	constructor(roomId: number, client: ChatClient, params?: Record<string, any>) {
		const socket = client.socket!;

		super('room:' + roomId, params, socket);
		this.client = client;
		this.roomId = roomId;
		this.socket = socket;
		(this.socket as any).channels.push(this);

		this.setupPresence();

		this.on('message', this.onMsg.bind(this));
		this.on('clear_notifications', this.onClearNotifications.bind(this));
		this.on('user_updated', this.onUserUpdated.bind(this));
		this.on('message_update', this.onUpdateMsg.bind(this));
		this.on('message_remove', this.onRemoveMsg.bind(this));

		this.onClose(() => {
			if (isInChatRoom(this.client, roomId)) {
				setChatRoom(this.client, undefined);

				// Reset the room we were in
				Vue.delete(this.client.usersOnline, roomId);
				Vue.delete(this.client.messages, roomId);
			}
		});
	}

	private setupPresence() {
		const presence = new Presence(this);

		presence.onSync(() => this.syncPresentUsers(presence, this.room));
	}

	private onMsg(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// If we receive a message from the currently logged in user on this room channel,
		// we ignore it.
		// We handle this message as incoming in the chat client as a response to sending the message.
		// So as to not duplicate the message in the room, ignore it here.
		if (this.client.currentUser && this.client.currentUser.id === message.user.id) {
			// The only exception is if that message was not already received, and the client is not having any messages queued.
			// This is so when a user has the same room open in two windows, and they send a message in one, they receive it in the other.
			// We can safely assume that they wouldn't try and use two windows to send messages in the same room at the same time.
			const hasQueuedMessages = this.client.messageQueue.some(
				i => i.room_id === message.room_id
			);
			const hasReceivedMessage = this.client.messages[message.room_id].some(
				i => i.id === message.id
			);
			if (hasQueuedMessages || hasReceivedMessage) {
				return;
			}
		}

		this.processNewRoomMessage(message);
	}

	processNewRoomMessage(message: ChatMessage) {
		const hasReceivedMessage = this.client.messages[message.room_id].some(
			i => i.id === message.id
		);
		if (hasReceivedMessage) {
			Analytics.trackEvent('chat', 'duplicate-message');
			return;
		}

		processNewChatOutput(this.client, this.roomId, [message], false);

		const friend = this.client.friendsList.getByRoom(message.room_id);
		if (friend) {
			friend.last_message_on = message.logged_on.getTime();
			this.client.friendsList.update(friend);
		}
	}

	private onClearNotifications(data: ClearNotificationsPayload) {
		if (isInChatRoom(this.client, data.room_id)) {
			Vue.delete(this.client.notifications, '' + data.room_id);
		}
	}

	private onUserUpdated(data: Partial<ChatUser>) {
		const updatedUser = new ChatUser(data);
		if (this.room && isInChatRoom(this.client, this.roomId) && this.room.isGroupRoom) {
			this.client.usersOnline[this.roomId].update(updatedUser);
		}
	}

	private onRemoveMsg(data: { id: number }) {
		if (this.room) {
			arrayRemove(this.client.messages[this.roomId], i => i.id === data.id);
		}
	}

	private onUpdateMsg(data: Partial<ChatMessage>) {
		const edited = new ChatMessage(data);
		if (this.room) {
			const index = this.client.messages[this.roomId].findIndex(msg => msg.id === data.id);
			const message = this.client.messages[this.roomId][index];

			message.content = edited.content;
			message.edited_on = edited.edited_on;
		}
	}

	private syncPresentUsers(presence: Presence, room: ChatRoom) {
		const presentUsers: ChatUser[] = [];
		const typing: ChatUser[] = [];

		presence.list((_id: string, roomPresence: RoomPresence) => {
			const user = new ChatUser(roomPresence.user);
			user.isOnline = true;
			presentUsers.push(user);

			if (roomPresence.metas.some(meta => meta.typing)) {
				typing.push(user);
			}
		});

		if (room.isGroupRoom) {
			Vue.set(
				this.client.usersOnline,
				'' + room.id,
				new ChatUserCollection(ChatUserCollection.TYPE_ROOM, presentUsers)
			);
		}
		Vue.set(this.client.typing, '' + room.id, typing);
	}
}
