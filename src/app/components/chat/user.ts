import { CHAT_ROLES } from './role';

export class ChatUser {
	id!: number;
	room_id!: number;
	last_message_on!: number;
	username!: string;
	display_name!: string;
	img_avatar!: string;
	permission_level!: number;
	is_verified!: boolean;

	isOnline = false;
	typing = false;

	role: CHAT_ROLES | null = null;

	constructor(data: Partial<ChatUser> = {}) {
		Object.assign(this, data);
	}

	get url() {
		return `/@${this.username}`;
	}
}
