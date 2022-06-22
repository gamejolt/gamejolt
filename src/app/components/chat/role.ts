export type CHAT_ROLES = 'owner' | 'moderator' | 'user';

export class ChatRole {
	user_id!: number;
	role!: CHAT_ROLES;

	constructor(data: any = {}) {
		Object.assign(this, data);
	}
}
