import { MediaItemModel } from '../../media-item/media-item-model';
import { ModelStoreModel } from '../../model/model-store.service';
import { ModelData, UnknownModelData } from '../../model/model.service';
import { ShopProductCommonFields } from '../../shop/product/product-model';

export class StickerPackModel implements ModelStoreModel, ShopProductCommonFields {
	declare id: number;
	declare name: string;
	declare description: string | undefined;
	declare payout_sticker_num: number;
	declare cost_coins: number;
	declare starts_on?: number;
	declare ends_on?: number;
	declare is_active?: boolean;
	declare media_item: MediaItemModel;

	// Shop fields
	declare is_premium: boolean;
	declare has_active_sale: boolean;
	declare was_approved: boolean;
	declare added_on: number | undefined;

	update(data: UnknownModelData | ModelData<StickerPackModel>) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}
	}
}
