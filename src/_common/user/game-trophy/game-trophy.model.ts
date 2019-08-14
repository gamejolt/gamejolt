import { Model } from '../../model/model.service';
import { arrayIndexBy } from '../../../utils/array';

export class UserGameTrophy extends Model {
	user_id!: number;
	game_id!: number;
	game_trophy_id!: number;
	logged_on!: number;

	constructor(data: any = {}) {
		super(data);
	}

	/**
	 * Indexes the achieved trophies by their trophy ID.
	 */
	static indexAchieved(trophies: UserGameTrophy[]) {
		return arrayIndexBy(trophies, 'game_trophy_id');
	}
}

Model.create(UserGameTrophy);
