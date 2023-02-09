import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export default class ChatInvite extends Model {
	static readonly STATUS_OPEN = 'open';
	static readonly STATUS_ACCEPTED = 'accepted';
	static readonly STATUS_DECLINED = 'declined';
	static readonly STATUS_CANCELED = 'canceled';

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

Model.create(ChatInvite);
