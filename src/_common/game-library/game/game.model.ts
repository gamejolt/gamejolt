import { GameModel } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class GameLibraryGameModel extends Model {
	declare user_id: number;
	declare game_id: number;
	declare game: GameModel;
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new GameModel(data.game);
		}
	}
}
