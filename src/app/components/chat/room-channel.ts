import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { ChatClient, isInChatRoom, processNewChatOutput, setChatRoom } from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

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

	private onMsg(data: any) {
		const message = new ChatMessage(data);
		processNewChatOutput(this.client, [message], false);

		const friend = this.client.friendsList.getByRoom(message.roomId);
		if (friend) {
			friend.lastMessageOn = message.loggedOn.getTime();
			this.client.friendsList.update(friend);
		}
	}

	private onClearNotifications(data: any) {
		if (isInChatRoom(this.client, data.room_id)) {
			Vue.delete(this.client.notifications, '' + data.room_id);
		}
	}

	private onUserUpdated(data: any) {
		if (this.room && isInChatRoom(this.client, this.roomId) && this.room.isGroupRoom) {
			this.client.usersOnline[this.roomId].update(data);
		}
	}

	private syncPresentUsers(presence: any, room: ChatRoom) {
		const presentUsers: ChatUser[] = [];
		presence.list((_id: number, pres: any) => {
			const user = new ChatUser(pres.user);
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
