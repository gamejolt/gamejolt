import { Model } from '../../../lib/gj-lib-client/components/model/model.service';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';

export class FeaturedItem extends Model {
	content: string;
	img_version: number;
	header_media_item: MediaItem;
	posted_on: number;
	game: Game;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(FeaturedItem);
