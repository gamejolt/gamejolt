import { Model } from '../../../lib/gj-lib-client/components/model/model.service';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';

export class FeaturedItem extends Model {
	game: Game;
	content: string;
	back_url: string;
	front_url: string;
	posted_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(FeaturedItem);
