import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { ChatClient, isInChatRoom, processNewChatOutput, setChatRoom } from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

interface RoomPresence {
	metas: { phx_ref: string }[];
	user: ChatUser;
}

interface ClearNotificationsPayload {
	room_id: number;
}

export class ChatRoomChannel extends Channel {
	room!: ChatRoom;
	roomId: number;
	readonly client: ChatClient;
	readonly socket: Socket;

	constructor(roomId: number, client: ChatClient, params?: object) {
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
			return;
		}

		this.processNewRoomMessage(message);
	}

	processNewRoomMessage(message: ChatMessage) {
		processNewChatOutput(this.client, [message], false);

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

	private syncPresentUsers(presence: Presence, room: ChatRoom) {
		const presentUsers: ChatUser[] = [];
		presence.list((_id: string, roomPresence: RoomPresence) => {
			const user = new ChatUser(roomPresence.user);
			user.isOnline = true;
			presentUsers.push(user);
		});

		if (room.isGroupRoom) {
			Vue.set(
				this.client.usersOnline,
				'' + room.id,
				new ChatUserCollection(ChatUserCollection.TYPE_ROOM, presentUsers)
			);
		}
	}
}
