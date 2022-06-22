import { Background } from '../../../_common/background/background.model';
import { ContentContext } from '../../../_common/content/content-context';
import { Translate } from '../../../_common/translate/translate.service';
import { ChatClient } from './client';
import { ChatRole } from './role';
import { ChatUser } from './user';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group' | 'fireside_group';

export class ChatRoom {
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';
	static readonly ROOM_FIRESIDE_GROUP = 'fireside_group';

	id!: number;
	title!: string;
	type!: ChatRoomType;
	user?: ChatUser;
	members!: ChatUser[];
	roles!: ChatRole[];
	owner_id!: number;
	last_message_on!: number;
	background?: Background;

	constructor(data: any = {}) {
		Object.assign(this, data);

		if (Array.isArray(data.members)) {
			this.members = (data.members as unknown[]).map(i => new ChatUser(i));
		}

		if (Array.isArray(data.roles)) {
			this.roles = (data.roles as unknown[]).map(i => new ChatRole(i));
		}

		if (data.background) {
			this.background = new Background(data.background);
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
			this.type === ChatRoom.ROOM_VIRAL_GROUP ||
			this.type === ChatRoom.ROOM_FIRESIDE_GROUP
		);
	}

	get isFiresideRoom() {
		return this.type === ChatRoom.ROOM_FIRESIDE_GROUP;
	}

	get shouldShowTimestamp() {
		return !this.isFiresideRoom;
	}

	/**
	 * Returns whether members of the room can be made moderators.
	 */
	get canElectModerators() {
		return this.isFiresideRoom;
	}

	get messagesContentContext(): ContentContext {
		if (this.type === 'fireside_group') {
			return 'fireside-chat-message';
		}

		return 'chat-message';
	}

	/**
	 * Updates (or creates) the role in this room for the input user.
	 */
	updateRoleForUser(updatedUser: ChatUser) {
		if (!updatedUser.role) {
			return;
		}

		// Try to find an existing role to update.
		const existingRoomRole = this.roles.find(i => i.user_id === updatedUser.id);
		if (existingRoomRole) {
			existingRoomRole.role = updatedUser.role;
		}
		// If no role exists in the room yet, create a new one.
		else {
			const newRole = new ChatRole({
				user_id: updatedUser.id,
				role: updatedUser.role,
			});
			this.roles.push(newRole);
		}

		// Update the owner id if the input user is the owner.
		if (updatedUser.role === 'owner') {
			this.owner_id = updatedUser.id;
		}
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
