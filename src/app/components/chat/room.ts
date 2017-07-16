import { ChatUser } from './user';
import { store } from '../../store/index';
import { ChatSiteModPermission } from './client';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group';

export class ChatRoom {
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';

	id: number;
	title: string;
	type: ChatRoomType;
	user?: ChatUser;

	description_compiled: string;
	description_markdown: string;

	staff: {
		permission: string;
		userId: number;
	}[];

	get chat() {
		return store.state.chat!;
	}

	constructor(data: Partial<ChatRoom> = {}) {
		Object.assign(this, data);
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

	get isMod() {
		if (!this.isGroupRoom) {
			return false;
		}

		// If they're a global site mod, then they can mod this room.
		if (this.chat.currentUser && this.chat.currentUser.permissionLevel >= ChatSiteModPermission) {
			return true;
		}

		const roomUser = this.currentRoomUser;
		return roomUser ? roomUser.isMod : false;
	}

	get isMutedGlobal() {
		if (!this.isGroupRoom) {
			return false;
		}

		const roomUser = this.currentRoomUser;
		return roomUser ? roomUser.isMutedGlobal : false;
	}

	get isMutedRoom() {
		if (!this.isGroupRoom) {
			return false;
		}

		const roomUser = this.currentRoomUser;
		return roomUser ? roomUser.isMutedRoom : false;
	}

	get isMuted() {
		return this.isMutedGlobal || this.isMutedRoom;
	}

	/**
	 * Returns the room user for the currently logged in user. This will have
	 * correct data for the current room.
	 */
	private get currentRoomUser() {
		// Chatting as guest.
		if (!this.chat.currentUser) {
			return undefined;
		}

		return this.chat.usersOnline[this.id].get(this.chat.currentUser.id);
	}
}
