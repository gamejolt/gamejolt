import { Model } from '../../model/model.service';
import { UserModel } from '../user.model';

export class UserBlockModel extends Model {
	declare blocked_on: number;
	declare expires_on: number;
	declare reason: string;
	declare resource: 'Community' | 'User';
	declare resource_id: number;

	declare user: UserModel;
	declare blocked_by_user?: UserModel | null;

	get doesExpire() {
		return this.expires_on > 0;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
		if (data.blocked_by_user) {
			this.blocked_by_user = new UserModel(data.blocked_by_user);
		}
	}
}
