export type CHAT_ROLES = 'owner' | 'moderator' | 'user';

// Note that this isn't really a model, just a bit of structured data that we
// use to keep track of roles.
export class ChatRole {
	declare user_id: number;
	declare role: CHAT_ROLES;

	constructor(data: any = {}) {
		Object.assign(this, data);
	}
}
