import { ChatUser } from './user';

export type ChatMessageType = 0 | 1;

export const CHAT_MESSAGE_MAX_CONTENT_LENGTH = 1000;

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
	_isQueued = false;
	_showAsQueued = false; // Only after some time do we show a message as queued. Before that, we pretend like it went through.
	_isProcessing = false;

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
