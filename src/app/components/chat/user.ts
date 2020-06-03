export class ChatUser {
	id!: number;
	room_id!: number;
	last_message_on!: number;
	username!: string;
	display_name!: string;
	img_avatar!: string;
	permission_level!: number;

	isOnline = false;

	constructor(data: Partial<ChatUser> = {}) {
		Object.assign(this, data);
	}

	get url() {
		return `/@${this.username}`;
	}
}
