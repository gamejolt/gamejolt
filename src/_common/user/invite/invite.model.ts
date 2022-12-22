import { Model } from '../../model/model.service';
import { User } from '../user.model';

export class UserInvite extends Model {
	declare inviter_user: User;
	declare invited_user: User;
	declare completed_on: number;

	constructor(data: Partial<UserInvite> = {}) {
		super(data);

		if (data.inviter_user) {
			this.inviter_user = new User(data.inviter_user);
		}
		if (data.invited_user) {
			this.invited_user = new User(data.invited_user);
		}
	}
}

Model.create(UserInvite);
