import { Model } from '../../model/model.service';
import { UserModel } from '../../user/user.model';
import { FiresideModel } from '../fireside.model';

export class FiresideStreamNotificationModel extends Model {
	declare fireside: FiresideModel;
	declare users: UserModel[];
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.fireside) {
			this.fireside = new FiresideModel(data.fireside);
		}

		if (data.users && Array.isArray(data.users)) {
			this.users = UserModel.populate(data.users);
		} else {
			this.users = [];
		}
	}
}
