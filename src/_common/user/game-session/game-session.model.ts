import { GameModel } from '~common/game/game.model';
import { Model } from '~common/model/model.service';

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
