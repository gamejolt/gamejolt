import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';
import { Fireside } from '../fireside.model';

export class FiresideStreamNotification extends Model {
	fireside!: Fireside;
	users!: User[];
	added_on!: number;

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

Model.create(FiresideStreamNotification);
