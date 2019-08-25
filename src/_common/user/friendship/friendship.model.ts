import { Model } from '../../model/model.service';
import { User } from '../user.model';
import { Api } from '../../api/api.service';

export class UserFriendship extends Model {
	static readonly STATE_NONE = 0;
	static readonly STATE_REQUEST_SENT = 1;
	static readonly STATE_REQUEST_RECEIVED = 2;
	static readonly STATE_FRIENDS = 3;

	user_id!: number;
	target_user_id!: number;
	user!: User;
	target_user!: User;
	created_on!: number;
	accepted_on!: number | null;
	declined_on!: number | null;
	state?: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.target_user) {
			this.target_user = new User(data.target_user);
		}
	}

	static async fetchRequests() {
		const response: any = await Api.sendRequest('/web/dash/friends/requests', null, {
			detach: true,
		});

		return {
			requests: UserFriendship.populate(response.requests) as UserFriendship[],
			pending: UserFriendship.populate(response.pending) as UserFriendship[],
		};
	}

	static fetchCount() {
		return Api.sendRequest('/web/dash/friends/requests/count', null, {
			detach: true,
		});
	}

	getThem(us: User) {
		return this.user_id !== us.id ? this.user : this.target_user;
	}

	$save() {
		return this.$_save('/web/dash/friends/requests/add/' + this.target_user_id, 'userFriendship');
	}

	$accept() {
		return this.$_save('/web/dash/friends/requests/accept/' + this.id, 'userFriendship');
	}

	$remove() {
		return this.$_remove('/web/dash/friends/requests/remove/' + this.id);
	}
}

Model.create(UserFriendship);
