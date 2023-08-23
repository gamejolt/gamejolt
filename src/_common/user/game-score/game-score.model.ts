import { Model } from '../../model/model.service';
import { User } from '../user.model';

export class UserGameScore extends Model {
	user_id!: number;
	user!: User;
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
			this.user = new User(data.user);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/api/scores/remove-score' + '/' + this.game_id + '/' + this.id
		);
	}
}
