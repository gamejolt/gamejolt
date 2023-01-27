import { Community } from '../../../_common/community/community.model';
import { Game } from '../../../_common/game/game.model';
import { Jam } from '../../../_common/jam/jam.model';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Model } from '../../../_common/model/model.service';

export class FeaturedItem extends Model {
	// Hero:
	declare game?: Game | null;
	declare jam?: Jam | null;
	declare community?: Community | null;
	declare hero_text: string | null;
	declare hero_button_text: string | null;
	declare hero_button_url: string | null;
	declare hero_front_media_item: MediaItem | null;
	declare hero_back_media_item: MediaItem | null;

	// Banner:
	declare banner_url: string | null;
	declare banner_media_item: MediaItem | null;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}
		if (data.jam) {
			this.jam = new Jam(data.jam);
		}
		if (data.community) {
			this.community = new Community(data.community);
		}
		if (data.hero_front_media_item) {
			this.hero_front_media_item = new MediaItem(data.hero_front_media_item);
		}
		if (data.hero_back_media_item) {
			this.hero_back_media_item = new MediaItem(data.hero_back_media_item);
		}
		if (data.banner_media_item) {
			this.banner_media_item = new MediaItem(data.banner_media_item);
		}
	}
}

Model.create(FeaturedItem);
