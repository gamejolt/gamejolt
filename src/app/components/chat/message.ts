import { ChatUser } from './user';

export type ChatMessageType = 0 | 1;

export class ChatMessage {
	static readonly TypeNormal = 0;
	static readonly TypeSystem = 1;

	id!: number;
	type!: ChatMessageType;
	user_id!: number;
	user!: ChatUser;
	room_id!: number;
	content!: string;
	logged_on!: Date;

	combine?: boolean;
	dateSplit?: boolean;

	// Used for rendering.
	_collapsable = false;
	_expanded = false;

	constructor(data: Partial<ChatMessage> = {}) {
		Object.assign(this, data);

		if (typeof this.logged_on === 'number' || typeof this.logged_on === 'string') {
			this.logged_on = new Date(this.logged_on);
		}

		if (data.user) {
			this.user = new ChatUser(data.user);
		}
	}
}
