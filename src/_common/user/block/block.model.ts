import { Model } from '../../model/model.service';
import { User } from '../user.model';

export class UserBlock extends Model {
	blocked_on!: number;
	expires_on!: number;
	reason!: string;
	resource!: 'Community';
	resource_id!: number;

	user!: User;
	blockedByUser?: User | null;

	get doesExpire() {
		return this.expires_on > 0;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
		if (data.blockedByUser) {
			this.user = new User(data.blockedByUser);
		}
	}
}

Model.create(UserBlock);
