import { MediaItemModel } from '../../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../../model/model.service';
import { ShopItemModelCommonFields } from '../../model/shop-item-model.service';

export class StickerPackModel extends Model implements ShopItemModelCommonFields {
	declare name: string;
	declare payout_sticker_num: number;
	declare cost_coins: number;
	declare starts_on?: number;
	declare ends_on?: number;
	declare is_active?: boolean;

	declare media_item: MediaItemModel;

	// Shop fields
	declare is_premium?: boolean;
	declare has_active_sale?: boolean;
	declare was_approved?: boolean;

	constructor(data: UnknownModelData | ModelData<StickerPackModel> = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}
	}
}
