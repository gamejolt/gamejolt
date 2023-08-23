import { BaseTrophy } from '../../trophy/base-trophy.model';
import { User } from '../../user/user.model';

export class SiteTrophy extends BaseTrophy {
	artist?: User;

	constructor(data: any = {}) {
		super(data);

		if (data.artist) {
			this.artist = new User(data.artist);
		}
	}
}
