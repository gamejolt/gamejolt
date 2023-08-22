import { Model, defineLegacyModel } from '../../model/model.service';
import { User } from '../user.model';

export const enum UserFriendshipState {
	None = 0,
	RequestSent = 1,
	RequestReceived = 2,
	Friends = 3,
}

export class UserFriendship extends defineLegacyModel(
	class UserFriendshipDefinition extends Model {
		declare user_id: number;
		declare target_user_id: number;
		declare user: User;
		declare target_user: User;
		declare created_on: number;
		declare accepted_on: number | null;
		declare declined_on: number | null;
		declare state?: UserFriendshipState;

		constructor(data: any = {}) {
			super(data);

			if (data.user) {
				this.user = new User(data.user);
			}

			if (data.target_user) {
				this.target_user = new User(data.target_user);
			}
		}

		getThem(us: User) {
			return this.user_id !== us.id ? this.user : this.target_user;
		}

		$save() {
			return this.$_save(
				'/web/dash/friends/requests/add/' + this.target_user_id,
				'userFriendship'
			);
		}

		$accept() {
			return this.$_save('/web/dash/friends/requests/accept/' + this.id, 'userFriendship');
		}

		$remove() {
			return this.$_remove('/web/dash/friends/requests/remove/' + this.id);
		}
	}
) {}
