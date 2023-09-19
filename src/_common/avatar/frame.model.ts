import { Model } from '../model/model.service';
import { ShopItemModelCommonFields } from '../model/shop-item-model.service';

export class AvatarFrameModel extends Model implements ShopItemModelCommonFields {
	declare image_url: string;
	declare name?: string;
	declare rarity?: number;
	declare description?: string;

	// Shop fields
	declare is_premium?: boolean;
	declare has_active_sale?: boolean;
	declare was_approved?: boolean;

	constructor(data: any = {}) {
		super(data);
	}
}
