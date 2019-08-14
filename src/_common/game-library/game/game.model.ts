import { Game } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class GameLibraryGame extends Model {
	user_id!: number;
	game_id!: number;
	game!: Game;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(GameLibraryGame);
