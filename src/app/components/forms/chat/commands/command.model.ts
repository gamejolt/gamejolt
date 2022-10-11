import { Model } from '../../../../../_common/model/model.service';

export const CHAT_MESSAGE_MAX_CONTENT_LENGTH = 1000;
export const TIMEOUT_CONSIDER_QUEUED = 1500; // Time in ms until a queued message should be displayed as such.

export type ChatMessageType = 'content' | 'sticker';

export class ChatCommand extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare prefix: string;
	declare command: string;
	declare message_content: string;
	declare is_active: boolean;
	declare invoke_delay: number;
	declare last_invoked: number;
	declare sort: number;
}

Model.create(ChatCommand);
