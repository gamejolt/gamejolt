import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export class CreatorReferral extends Model {
	declare share_part: number;
	declare start_time: number;
	declare completed_on: number;

	declare user: User;

	constructor(data: Partial<CreatorReferral> = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}
}

Model.create(CreatorReferral);
