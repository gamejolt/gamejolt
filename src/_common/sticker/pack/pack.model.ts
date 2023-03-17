import { MediaItem } from '../../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../../model/model.service';

export class StickerPack extends Model {
	declare name: string;
	declare payout_sticker_num: number;
	declare cost_coins: number;
	declare starts_on?: number;
	declare ends_on?: number;
	declare is_active?: boolean;

	declare media_item: MediaItem;

	constructor(data: UnknownModelData | ModelData<StickerPack> = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}
	}
}

Model.create(StickerPack);
