import { Model } from '../../model/model.service';
import { User } from '../user.model';

export class UserBlock extends Model {
	declare blocked_on: number;
	declare expires_on: number;
	declare reason: string;
	declare resource: 'Community' | 'User';
	declare resource_id: number;

	declare user: User;
	declare blocked_by_user?: User | null;

	get doesExpire() {
		return this.expires_on > 0;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
		if (data.blocked_by_user) {
			this.blocked_by_user = new User(data.blocked_by_user);
		}
	}
}
