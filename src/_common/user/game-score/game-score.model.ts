import { Model } from '../../model/model.service';
import { UserModel } from '../user.model';

export class UserGameScoreModel extends Model {
	declare user_id: number;
	declare user: UserModel;
	declare game_id: number;
	declare table_id: number;
	declare guest: string;
	declare score: string;
	declare sort: number;
	declare extra_data: string;
	declare logged_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}
}

export function $removeUserGameScore(model: UserGameScoreModel) {
	return model.$_remove(
		'/web/dash/developer/games/api/scores/remove-score' + '/' + model.game_id + '/' + model.id
	);
}
