import { GameModel } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class UserGameSessionModel extends Model {
	user_id!: number;
	game_id!: number;
	game!: GameModel;
	opened_on!: number;
	total_time!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new GameModel(data.game);
		}
	}
}
