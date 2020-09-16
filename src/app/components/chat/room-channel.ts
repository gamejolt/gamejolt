import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { arrayRemove } from '../../../utils/array';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { ChatClient, isInChatRoom, processNewChatOutput, setChatRoom } from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';

interface RoomPresence {
	metas: { phx_ref: string; typing: boolean }[];
	user: ChatUser;
}

export class ChatRoomChannel extends Channel {
	room!: ChatRoom;
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
		this.on('user_updated', this.onUserUpdated.bind(this));
		this.on('message_update', this.onUpdateMsg.bind(this));
		this.on('message_remove', this.onRemoveMsg.bind(this));

		this.onClose(() => {
			if (isInChatRoom(this.client, roomId)) {
				setChatRoom(this.client, undefined);

				// Reset the room we were in
				Vue.delete(this.client.roomMembers, roomId);
				Vue.delete(this.client.messages, roomId);
			}
		});
	}

	private setupPresence() {
		const presence = new Presence(this);

		presence.onJoin(this.onUserJoin.bind(this));
		presence.onLeave(this.onUserLeave.bind(this));
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

	private onUserUpdated(data: Partial<ChatUser>) {
		const updatedUser = new ChatUser(data);
		if (this.room && isInChatRoom(this.client, this.roomId) && this.room.isGroupRoom) {
			this.client.roomMembers[this.roomId].update(updatedUser);
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

	private onUserJoin(presenceId: string, currentPresence: RoomPresence | undefined) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			this.client.roomMembers[this.roomId].online(userId);
		}
	}

	private onUserLeave(presenceId: string, currentPresence: RoomPresence | undefined) {
		// If the user has left all devices.
		if (currentPresence && currentPresence.metas.length === 0) {
			const userId = +presenceId;
			this.client.roomMembers[this.roomId].offline(userId);
		}
	}

	private syncPresentUsers(presence: Presence, room: ChatRoom) {
		presence.list((id: string, roomPresence: RoomPresence) => {
			const roomMembers = this.client.roomMembers[room.id];
			const user = roomMembers.get(+id) || new ChatUser(roomPresence.user);
			user.typing = roomPresence.metas.some(meta => meta.typing);
			roomMembers.update(user);
			roomMembers.online(+id);
		});
	}
}
