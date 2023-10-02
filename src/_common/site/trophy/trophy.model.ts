import { BaseTrophyModel } from '../../trophy/base-trophy.model';
import { UserModel } from '../../user/user.model';

export class SiteTrophyModel extends BaseTrophyModel {
	declare artist?: UserModel;

	constructor(data: any = {}) {
		super(data);

		if (data.artist) {
			this.artist = new UserModel(data.artist);
		}
	}
}
