import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export class SiteTemplate extends Model {
	declare key: string;
	declare name: string;
	declare description: string;
	declare data: any | null;
	declare user: User;

	constructor(data: any = {}) {
		super(data);

		if (data.data) {
			if (typeof data.data === 'string') {
				this.data = JSON.parse(data.data) || {};
			} else {
				this.data = data.data;
			}
		}

		if (data.user) {
			this.user = new User(data.user);
		}
	}
}
