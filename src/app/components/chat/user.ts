import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import { Jolticon } from '../../../_common/jolticon/AppJolticon.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { ChatClient, tryGetRoomRole } from './client';
import { ChatMessage } from './message';
import { CHAT_ROLES } from './role';
import { ChatRoom } from './room';

export class ChatUser {
	id!: number;
	room_id!: number;
	last_message_on!: number;
	username!: string;
	display_name!: string;
	img_avatar!: string;
	permission_level!: number;
	is_verified!: boolean;
	is_creator?: boolean;

	isOnline = false;
	typing = false;

	role: CHAT_ROLES | null = null;

	firesideHost: FiresideRTCHost | null = null;

	constructor(data: any = {}) {
		Object.assign(this, data);
	}

	get url() {
		return `/@${this.username}`;
	}

	get isStaff() {
		return this.permission_level > 0;
	}

	get isLive() {
		if (!this.firesideHost || this.firesideHost.needsPermissionToView) {
			return false;
		}
		return this.firesideHost.isLive;
	}
}

interface ChatRoleData {
	icon: Jolticon;
	tooltip: string;
}

export function getChatUserRoleData(
	chat: ChatClient,
	room: ChatRoom,
	user: ChatUser,
	extras: {
		/**
		 * Can be provided to display a robot Jolticon for automated chat
		 * messages.
		 */
		mesage?: ChatMessage;
	} = {}
): ChatRoleData | undefined {
	if (extras.mesage?.is_automated) {
		return {
			icon: 'robot',
			tooltip: $gettext(`Automated Message`),
		};
	}

	if (room.owner_id === user.id) {
		return {
			icon: 'crown',
			tooltip: $gettext(`Room Owner`),
		};
	}

	if (user.firesideHost) {
		return {
			icon: 'star-ten-pointed',
			tooltip: $gettext(`Host`),
		};
	}

	if (tryGetRoomRole(chat, room, user) === 'moderator') {
		return {
			icon: 'star',
			tooltip: $gettext(`Chat Moderator`),
		};
	}

	// In public rooms, display staff member status.
	if (!room.isPrivateRoom && user.isStaff) {
		return {
			icon: 'gamejolt',
			tooltip: $gettext(`Game Jolt Staff`),
		};
	}
}
