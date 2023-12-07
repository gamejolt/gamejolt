import { GameModel } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class UserGameSessionModel extends Model {
	declare user_id: number;
	declare game_id: number;
	declare game: GameModel;
	declare opened_on: number;
	declare total_time: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new GameModel(data.game);
		}
	}
}
