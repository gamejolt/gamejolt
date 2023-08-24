import { MediaItemModel } from '../../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../../model/model.service';

export class StickerPackModel extends Model {
	declare name: string;
	declare payout_sticker_num: number;
	declare cost_coins: number;
	declare starts_on?: number;
	declare ends_on?: number;
	declare is_active?: boolean;

	declare media_item: MediaItemModel;

	constructor(data: UnknownModelData | ModelData<StickerPackModel> = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}
	}
}
