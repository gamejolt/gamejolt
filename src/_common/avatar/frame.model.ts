import { ModelStoreModel } from '../model/model-store.service';
import { ShopProductCommonFields } from '../shop/product/product-model';

export class AvatarFrameModel implements ModelStoreModel, ShopProductCommonFields {
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
