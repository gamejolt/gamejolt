import { BaseTrophyModel } from '../../trophy/base-trophy.model';
import { UserModel } from '../../user/user.model';

export class SiteTrophy extends BaseTrophyModel {
	artist?: UserModel;

	constructor(data: any = {}) {
		super(data);

		if (data.artist) {
			this.artist = new UserModel(data.artist);
		}
	}
}
