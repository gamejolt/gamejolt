import { User } from '../../../_common/user/user.model';
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

	static fromUser(user: User, roomId: number) {
		return new ChatUser({
			id: user.id,
			room_id: roomId,
			last_message_on: 0,
			username: user.username,
			display_name: user.display_name,
			img_avatar: user.img_avatar,
			permission_level: user.permission_level,
			is_verified: user.is_verified,
		});
	}

	get url() {
		return `/@${this.username}`;
	}
}
