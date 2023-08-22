import { Model, defineLegacyModel } from '../../../model/model.service';
import { User } from '../../../user/user.model';

export class GameDataStoreItem extends defineLegacyModel(
	class GameDataStoreItemDefinition extends Model {
		declare user_id: number;
		declare user: User;
		declare game_id: number;
		declare key: string;
		declare data: string;
		declare posted_on: number;
		declare status: number;

		constructor(data: any = {}) {
			super(data);

			if (data.user) {
				this.user = new User(data.user);
			}
		}

		$remove() {
			return this.$_remove(
				'/web/dash/developer/games/api/data-storage/remove-item/' +
					this.game_id +
					'/' +
					this.id
			);
		}
	}
) {}
