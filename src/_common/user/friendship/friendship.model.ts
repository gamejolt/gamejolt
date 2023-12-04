import { Model } from '../../model/model.service';
import { UserModel } from '../user.model';

export const enum UserFriendshipState {
	None = 0,
	RequestSent = 1,
	RequestReceived = 2,
	Friends = 3,
}

export class UserFriendshipModel extends Model {
	declare user_id: number;
	declare target_user_id: number;
	declare user: UserModel;
	declare target_user: UserModel;
	declare created_on: number;
	declare accepted_on: number | null;
	declare declined_on: number | null;
	declare state?: UserFriendshipState;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.target_user) {
			this.target_user = new UserModel(data.target_user);
		}
	}

	getThem(us: UserModel) {
		return this.user_id !== us.id ? this.user : this.target_user;
	}
}

export function $saveUserFriendship(model: UserFriendshipModel) {
	return model.$_save('/web/dash/friends/requests/add/' + model.target_user_id, 'userFriendship');
}

export function $acceptUserFriendship(model: UserFriendshipModel) {
	return model.$_save('/web/dash/friends/requests/accept/' + model.id, 'userFriendship');
}

export function $removeUserFriendship(model: UserFriendshipModel) {
	return model.$_remove('/web/dash/friends/requests/remove/' + model.id);
}
