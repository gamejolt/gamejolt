import { Model } from '../../../model/model.service';
import { UserModel } from '../../../user/user.model';

export class GameDataStoreItemModel extends Model {
	declare user_id: number;
	declare user: UserModel;
	declare game_id: number;
	declare key: string;
	declare data: string;
	declare posted_on: number;
	declare status: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/api/data-storage/remove-item/' + this.game_id + '/' + this.id
		);
	}
}
