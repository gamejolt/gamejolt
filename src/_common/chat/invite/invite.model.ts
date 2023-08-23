import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export const ChatInviteStatusOpen = 'open';
export const ChatInviteStatusAccepted = 'accepted';
export const ChatInviteStatusDeclined = 'declined';
export const ChatInviteStatusCanceled = 'canceled';

export class ChatInvite extends Model {
	declare invited_user: User;
	declare inviter_user: User;
	declare room_title: string;
	declare chat_message_id: number;
	declare status: string;
	declare added_on: number;

	constructor(data: Partial<ChatInvite> = {}) {
		super(data);

		if (data.invited_user) {
			this.invited_user = new User(data.invited_user);
		}
		if (data.inviter_user) {
			this.inviter_user = new User(data.inviter_user);
		}
	}
}
