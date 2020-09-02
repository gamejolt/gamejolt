import { ChatUser } from './user';

export type ChatMessageType = 0 | 1;

export const CHAT_MESSAGE_MAX_CONTENT_LENGTH = 1000;
export const TIMEOUT_CONSIDER_QUEUED = 1500; // Time in ms until a queued message should be displayed as such.

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
	edited_on!: Date | null;

	combine?: boolean;
	dateSplit?: boolean;

	// Used for rendering.
	_collapsable = false;
	_expanded = false;
	_isQueued = false;
	_showAsQueued = false; // Only after some time do we show a message as queued. Before that, we pretend like it went through.
	_isProcessing = false;
	_error = false; // When an error was received trying to send the message.

	constructor(data: Partial<ChatMessage> = {}) {
		Object.assign(this, data);

		if (typeof this.logged_on === 'number' || typeof this.logged_on === 'string') {
			this.logged_on = new Date(this.logged_on);
		}

		if (typeof this.edited_on === 'number' || typeof this.edited_on === 'string') {
			this.edited_on = new Date(this.edited_on);
		}

		if (data.user) {
			this.user = new ChatUser(data.user);
		}
	}
}
