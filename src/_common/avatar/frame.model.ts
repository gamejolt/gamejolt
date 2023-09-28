import { ModelStoreModel } from '../model/model-store.service';
import { ShopItemModelCommonFields } from '../model/shop-item-model.service';

export class AvatarFrameModel implements ModelStoreModel, ShopItemModelCommonFields {
	declare id: number;
	declare image_url: string;
	declare name: string;
	declare description: string | undefined;
	declare rarity?: number;

	// Shop fields
	declare is_premium: boolean;
	declare has_active_sale: boolean;
	declare was_approved: boolean;
	declare added_on: number | undefined;

	update(data: any) {
		Object.assign(this, data);
	}
}
