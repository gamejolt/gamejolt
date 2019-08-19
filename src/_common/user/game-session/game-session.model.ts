import { Model } from '../../model/model.service';
import { Game } from '../../game/game.model';

export class UserGameSession extends Model {
	user_id!: number;
	game_id!: number;
	game!: Game;
	opened_on!: number;
	total_time!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(UserGameSession);
