import { Background } from '../../../_common/background/background.model';
import { ContentContext } from '../../../_common/content/content-context';
import { ModelStoreModel } from '../../../_common/model/model-store.service';
import { $gettext } from '../../../_common/translate/translate.service';
import { ChatClient } from './client';
import { ChatMessage } from './message';
import { ChatRole } from './role';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group' | 'fireside_group';

interface TypingUserData {
	username: string;
}

export class ChatRoom implements ModelStoreModel {
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';
	static readonly ROOM_FIRESIDE_GROUP = 'fireside_group';

	declare id: number;
	declare title: string;
	declare type: ChatRoomType;
	declare user?: ChatUser;
	declare roles: ChatRole[];
	declare member_count: number;
	declare owner_id: number;
	declare last_message_on: number;
	declare background?: Background;

	declare chat: ChatClient;
	declare memberCollection: ChatUserCollection;
	messagesPopulated = false;
	messages: ChatMessage[] = [];
	queuedMessages: ChatMessage[] = [];
	messageEditing: null | ChatMessage = null;

	/** Indexed by user ID */
	usersTyping = new Map<number, TypingUserData>();

	constructor(data: any) {
		this.update(data);
	}

	update(data: any = {}) {
		Object.assign(this, data);

		if (!data.chat) {
			throw new Error(`Chat not passed in.`);
		}

		this.chat = data.chat;

		if (Array.isArray(data.roles)) {
			this.roles = (data.roles as unknown[]).map(i => new ChatRole(i));
		}

		if (data.background) {
			this.background = new Background(data.background);
		}

		const initialMembers = data.members || [];
		if (this.memberCollection) {
			if (initialMembers.length > 0) {
				this.memberCollection.replace(initialMembers);
			}
		} else {
			this.memberCollection = new ChatUserCollection(
				this.chat,
				this.isFiresideRoom
					? ChatUserCollection.TYPE_FIRESIDE
					: ChatUserCollection.TYPE_ROOM,
				initialMembers
			);
		}

		if (this.type === ChatRoom.ROOM_PM) {
			// We need to rename the room to the username
			this.user = this.chat.friendsList.getByRoom(this.id);
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

export function getChatRoomTitle(room: ChatRoom) {
	if (room.type === ChatRoom.ROOM_PM) {
		return room.user?.display_name ?? $gettext(`PM Chat`);
	}

	if (room.title) {
		return room.title;
	}

	// When no title is set and no/one member is in the chat, set the title
	// to "Group Chat" instead of just the single name.
	if (room.memberCollection.count <= 1) {
		return $gettext(`Group Chat`);
	}

	// No room title, return a comma separated list of members.
	const chat = room.chat;
	return room.memberCollection.users
		.filter(i => i.id !== chat.currentUser?.id)
		.slice(0, 5)
		.map(i => i.display_name)
		.join(', ');
}
