import { Model } from '../../../model/model.service';
import { User } from '../../../user/user.model';

export class GameDataStoreItem extends Model {
	user_id!: number;
	user!: User;
	game_id!: number;
	key!: string;
	data!: string;
	posted_on!: number;
	status!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/api/data-storage/remove-item/' + this.game_id + '/' + this.id
		);
	}
}

Model.create(GameDataStoreItem);
