import { Model } from '../../../_common/model/model.service';

export const CHAT_MESSAGE_MAX_CONTENT_LENGTH = 1000;
export const TIMEOUT_CONSIDER_QUEUED = 1500; // Time in ms until a queued message should be displayed as such.

export type ChatMessageType = 'content' | 'sticker';

export class ChatCommand extends Model {
	prefix!: string;
	command!: string;
	message_content!: string;
	is_active!: boolean;
	invoke_delay!: number;
	last_invoked!: number;
	sort!: number;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(ChatCommand);
