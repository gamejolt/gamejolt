import { Game } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class GameLibraryGame extends Model {
	declare user_id: number;
	declare game_id: number;
	declare game: Game;
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}
