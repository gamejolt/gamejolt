import { Model } from '../../model/model.service';
import { UserModel } from '../../user/user.model';

export const ChatInviteStatusOpen = 'open';
export const ChatInviteStatusAccepted = 'accepted';
export const ChatInviteStatusDeclined = 'declined';
export const ChatInviteStatusCanceled = 'canceled';

export class ChatInviteModel extends Model {
	declare invited_user: UserModel;
	declare inviter_user: UserModel;
	declare room_title: string;
	declare chat_message_id: number;
	declare status: string;
	declare added_on: number;

	constructor(data: Partial<ChatInviteModel> = {}) {
		super(data);

		if (data.invited_user) {
			this.invited_user = new UserModel(data.invited_user);
		}
		if (data.inviter_user) {
			this.inviter_user = new UserModel(data.inviter_user);
		}
	}
}
