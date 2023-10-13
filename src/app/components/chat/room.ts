import { BackgroundModel } from '../../../_common/background/background.model';
import { ModelStoreModel } from '../../../_common/model/model-store.service';
import { $gettext } from '../../../_common/translate/translate.service';
import { ChatClient } from './client';
import { ChatMessageModel } from './message';
import { ChatRole } from './role';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

const enum ChatRoomType {
	PM = 'pm',
	OPEN_GROUP = 'open_group',
	CLOSED_GROUP = 'closed_group',
	VIRAL_GROUP = 'viral_group',
}

interface TypingUserData {
	username: string;
}

export class ChatRoomModel implements ModelStoreModel {
	declare id: number;
	declare title: string;
	declare fallback_title: string;
	declare type: ChatRoomType;
	declare user?: ChatUser;
	declare roles: ChatRole[];
	declare member_count: number;
	declare owner_id: number;
	declare last_message_on: number;
	declare background?: BackgroundModel;

	declare chat: ChatClient;
	declare memberCollection: ChatUserCollection;
	messagesPopulated = false;
	messages: ChatMessageModel[] = [];
	queuedMessages: ChatMessageModel[] = [];
	messageEditing: null | ChatMessageModel = null;

	/** Indexed by user ID */
	usersTyping = new Map<number, TypingUserData>();

	declare messageLimit: number | null;

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
			this.background = new BackgroundModel(data.background);
		}

		const initialMembers = data.members || [];
		if (this.memberCollection) {
			if (initialMembers.length > 0) {
				this.memberCollection.replace(initialMembers);
			}
		} else {
			this.memberCollection = new ChatUserCollection(
				this.chat,
				ChatUserCollection.TYPE_ROOM,
				initialMembers
			);
		}

		if (this.type === ChatRoomType.PM) {
			// We need to rename the room to the username
			this.user = this.chat.friendsList.getByRoom(this.id);
		}

		// Assign the message limit according to the room type.
		//
		// NOTE: Left over from Firesides, but might be used in the future.
		switch (this.type) {
			case ChatRoomType.PM:
			case ChatRoomType.CLOSED_GROUP:
			case ChatRoomType.OPEN_GROUP:
			case ChatRoomType.VIRAL_GROUP:
				this.messageLimit = null;
		}
	}

	get isPmRoom() {
		return this.type === ChatRoomType.PM;
	}

	get isPrivateRoom() {
		return this.type === ChatRoomType.PM || this.type === ChatRoomType.CLOSED_GROUP;
	}

	get isGroupRoom() {
		return (
			this.type === ChatRoomType.OPEN_GROUP ||
			this.type === ChatRoomType.CLOSED_GROUP ||
			this.type === ChatRoomType.VIRAL_GROUP
		);
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

export function getChatRoomTitle(room: ChatRoomModel) {
	if (room.type === ChatRoomType.PM) {
		return room.user?.display_name ?? $gettext(`PM Chat`);
	}

	if (room.title) {
		return room.title;
	}

	if (room.fallback_title) {
		return room.fallback_title;
	}

	return $gettext(`Group Chat`);
}
