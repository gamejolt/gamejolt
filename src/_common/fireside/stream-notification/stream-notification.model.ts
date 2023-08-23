import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';

export class FiresideStreamNotification extends Model {
	declare fireside: Fireside;
	declare users: User[];
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.fireside) {
			this.fireside = new Fireside(data.fireside);
		}

		if (data.users && Array.isArray(data.users)) {
			this.users = User.populate(data.users);
		} else {
			this.users = [];
		}
	}
}
