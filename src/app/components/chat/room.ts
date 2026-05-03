import { ChatClient } from '~app/components/chat/client';
import { ChatMessageModel } from '~app/components/chat/message';
import { ChatRole } from '~app/components/chat/role';
import { ChatUser } from '~app/components/chat/user';
import { ChatUserCollection } from '~app/components/chat/user-collection';
import { BackgroundModel } from '~common/background/background.model';
import { ModelStoreModel, storeModel } from '~common/model/model-store.service';
import { $gettext } from '~common/translate/translate.service';

const ChatRoomTypePM = 'pm';
const ChatRoomTypeOPEN_GROUP = 'open_group';
const ChatRoomTypeCLOSED_GROUP = 'closed_group';
const ChatRoomTypeVIRAL_GROUP = 'viral_group';

type ChatRoomType =
	| typeof ChatRoomTypePM
	| typeof ChatRoomTypeOPEN_GROUP
	| typeof ChatRoomTypeCLOSED_GROUP
	| typeof ChatRoomTypeVIRAL_GROUP;

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
			this.background = storeModel(BackgroundModel, data.background);
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

		if (this.type === ChatRoomTypePM) {
			// We need to rename the room to the username
			this.user = this.chat.friendsList.getByRoom(this.id);
		}

		// Assign the message limit according to the room type.
		//
		// NOTE: Left over from Firesides, but might be used in the future.
		switch (this.type) {
			case ChatRoomTypePM:
			case ChatRoomTypeCLOSED_GROUP:
			case ChatRoomTypeOPEN_GROUP:
			case ChatRoomTypeVIRAL_GROUP:
				this.messageLimit = null;
		}
	}

	get isPmRoom() {
		return this.type === ChatRoomTypePM;
	}

	get isPrivateRoom() {
		return this.type === ChatRoomTypePM || this.type === ChatRoomTypeCLOSED_GROUP;
	}

	get isGroupRoom() {
		return (
			this.type === ChatRoomTypeOPEN_GROUP ||
			this.type === ChatRoomTypeCLOSED_GROUP ||
			this.type === ChatRoomTypeVIRAL_GROUP
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
	if (room.type === ChatRoomTypePM) {
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
