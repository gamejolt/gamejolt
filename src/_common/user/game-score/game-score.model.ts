import { Model } from '../../model/model.service';
import { UserModel } from '../user.model';

export class UserGameScoreModel extends Model {
	user_id!: number;
	user!: UserModel;
	game_id!: number;
	table_id!: number;
	guest!: string;
	score!: string;
	sort!: number;
	extra_data!: string;
	logged_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/api/scores/remove-score' + '/' + this.game_id + '/' + this.id
		);
	}
}
