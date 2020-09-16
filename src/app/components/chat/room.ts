import { ChatClient } from './client';
import { ChatUser } from './user';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group';

export class ChatRoom {
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';

	id!: number;
	type!: ChatRoomType;
	user?: ChatUser;
	members!: ChatUser[];

	constructor(data: Partial<ChatRoom> = {}) {
		Object.assign(this, data);

		if (data.members) {
			this.members = data.members.map(member => new ChatUser(member));
		}
	}

	get isPmRoom() {
		return this.type === ChatRoom.ROOM_PM;
	}

	get isPrivateRoom() {
		return this.type === ChatRoom.ROOM_PM || this.type === ChatRoom.ROOM_CLOSED_GROUP;
	}

	get isGroupRoom() {
		return (
			this.type === ChatRoom.ROOM_OPEN_GROUP ||
			this.type === ChatRoom.ROOM_CLOSED_GROUP ||
			this.type === ChatRoom.ROOM_VIRAL_GROUP
		);
	}

	getGroupTitle(chat: ChatClient) {
		return this.members
			.filter(member => member.id !== chat.currentUser?.id)
			.map(member => member.display_name)
			.join(', ');
	}
}
