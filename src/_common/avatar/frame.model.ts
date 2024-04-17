import { ModelStoreModel } from '../model/model-store.service';
import { ShopProductCommonFields } from '../shop/product/product-model';

export const DefaultAvatarFrameScale = 1.2;

export class AvatarFrameModel implements ModelStoreModel, ShopProductCommonFields {
	declare id: number;
	declare image_url: string;
	declare name: string;
	declare description: string | undefined;
	declare rarity?: number;

	// Shop fields
	declare is_premium: boolean;
	declare is_animated: boolean;
	declare has_active_sale: boolean;
	declare was_approved: boolean;
	declare added_on: number | undefined;

	/** Ratio of size between the avatar frame and the user avatar. */
	declare scale: number;

	update(data: any) {
		Object.assign(this, data);

		if (typeof data.scale !== 'number' || data.scale <= 0) {
			this.scale = DefaultAvatarFrameScale;
		}
	}
}
