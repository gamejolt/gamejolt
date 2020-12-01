import { Translate } from '../../../_common/translate/translate.service';
import { ChatClient } from './client';
import { ChatUser } from './user';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group';

export class ChatRoom {
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';

	id!: number;
	title!: string;
	type!: ChatRoomType;
	user?: ChatUser;
	members!: ChatUser[];
	owner_id!: number;
	last_message_on!: number;

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
}

export function getChatRoomTitle(room: ChatRoom, chat: ChatClient) {
	if (room.title) {
		return room.title;
	}

	// When no title is set and no/one member is in the chat, set the title
	// to "Group Chat" instead of just the single name.
	if (!room.members || room.members.length === 1) {
		return Translate.$gettext(`Group Chat`);
	}

	// No room title, return a comma separated list of members.
	return room.members
		.filter(member => member.id !== chat.currentUser?.id)
		.map(member => member.display_name)
		.join(', ');
}
