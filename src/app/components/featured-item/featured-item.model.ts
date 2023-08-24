import { CommunityModel } from '../../../_common/community/community.model';
import { GameModel } from '../../../_common/game/game.model';
import { MediaItemModel } from '../../../_common/media-item/media-item-model';
import { Model } from '../../../_common/model/model.service';

export class FeaturedItemModel extends Model {
	// Hero:
	declare game?: GameModel | null;
	declare community?: CommunityModel | null;
	declare hero_text: string | null;
	declare hero_button_text: string | null;
	declare hero_button_url: string | null;
	declare hero_front_media_item: MediaItemModel | null;
	declare hero_back_media_item: MediaItemModel | null;

	// Banner:
	declare banner_url: string | null;
	declare banner_media_item: MediaItemModel | null;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new GameModel(data.game);
		}
		if (data.community) {
			this.community = new CommunityModel(data.community);
		}
		if (data.hero_front_media_item) {
			this.hero_front_media_item = new MediaItemModel(data.hero_front_media_item);
		}
		if (data.hero_back_media_item) {
			this.hero_back_media_item = new MediaItemModel(data.hero_back_media_item);
		}
		if (data.banner_media_item) {
			this.banner_media_item = new MediaItemModel(data.banner_media_item);
		}
	}
}
