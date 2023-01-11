import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export default class ChatInvite extends Model {
	static readonly STATUS_OPEN = 'open';
	static readonly STATUS_ACCEPTED = 'accepted';
	static readonly STATUS_DECLINED = 'declined';
	static readonly STATUS_CANCELED = 'canceled';

	declare user: User;
	declare by_user: User;
	declare room_title: string;
	declare chat_message_id: number;
	declare status: string;
	declare added_on: number;

	constructor(data: Partial<ChatInvite> = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
		if (data.by_user) {
			this.user = new User(data.by_user);
		}
	}
}

Model.create(ChatInvite);
