import { Model } from '../../../../../_common/model/model.service';

export const CHAT_COMMAND_TYPE_COMMAND = 'command';
export const CHAT_COMMAND_TYPE_TIMER = 'timer';

export class ChatCommand extends Model {
	declare type: 'command' | 'timer';
	declare prefix: string;
	declare command: string;
	declare message_content: string;
	declare is_active: boolean;
	declare invoke_delay: number;
	declare invoke_schedule: number;
	declare num_required_messages: number;
	declare last_invoked: number;
	declare sort: number;
}
