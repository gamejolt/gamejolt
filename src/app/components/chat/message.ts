import { ChatUser } from './user';

export type ChatMessageType = 0 | 1;
export type ChatMessageState = 'PENDING' | 'SENT' | 'FAILED';

export class ChatMessage {
	static readonly TypeNormal = 0;
	static readonly TypeSystem = 1;
	static readonly StatePending = 'PENDING';
	static readonly StateSent = 'SENT';
	static readonly StateFailed = 'FAILED';

	id!: number;
	type!: ChatMessageType;
	userId!: number;
	user!: ChatUser;
	roomId!: number;
	content!: string;
	loggedOn!: Date;
	combine?: boolean;
	dateSplit?: boolean;
	state?: ChatMessageState;
	objectId: symbol = Symbol();

	// Used for rendering.
	_collapsable = false;
	_expanded = false;

	constructor(data: Partial<ChatMessage> = {}) {
		Object.assign(this, data);

		if (typeof this.loggedOn === 'number' || typeof this.loggedOn === 'string') {
			this.loggedOn = new Date(this.loggedOn);
		}

		if (data.user) {
			this.user = new ChatUser(data.user);
		}
	}
}
