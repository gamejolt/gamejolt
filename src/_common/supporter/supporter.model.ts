import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class Supporter extends Model {
	declare from: User;
	declare type: 'charged-sticker';

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.from = new User(data.user);
		}
	}
}

Model.create(Supporter);
