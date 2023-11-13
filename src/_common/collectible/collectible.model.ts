import { isInstance } from '../../utils/utils';
import { AvatarFrameModel } from '../avatar/frame.model';
import { BackgroundModel } from '../background/background.model';
import { ModelStoreModel, getModel, storeModelList } from '../model/model-store.service';
import { StickerPackModel } from '../sticker/pack/pack.model';
import { UserStickerPackModel } from '../sticker/pack/user-pack.model';
import { StickerModel } from '../sticker/sticker.model';
import { UserAvatarFrameModel } from '../user/user-avatar/frame/frame.model';
import { UserModel } from '../user/user.model';
import { AcquisitionModel } from './acquisition.model';

export const enum CollectibleType {
	Sticker = 'Sticker',
	Background = 'Background',
	AvatarFrame = 'Avatar_Frame',
}

export class CollectibleModel implements ModelStoreModel {
	declare id: string;
	declare inventory_collection_id: string;
	declare type: CollectibleType;
	declare name: string;
	declare rarity: number;
	declare image_url: string;
	declare description: string;
	declare artist_user?: UserModel;
	declare is_secret: boolean;
	declare is_unlocked: boolean;
	declare sticker_mastery?: number;

	acquisition: AcquisitionModel[] = [];

	update(data: any) {
		Object.assign(this, data);

		this.acquisition = storeModelList(AcquisitionModel, data.acquisition);
	}
}

export function markProductAsPurchased(
	purchasedProduct:
		| UserAvatarFrameModel
		| AvatarFrameModel
		| BackgroundModel
		| UserStickerPackModel
		| StickerPackModel
		| StickerModel
) {
	// Sticker packs aren't really collectibles right now, but in case that
	// changes we should allow this to accept them.
	if (
		isInstance(purchasedProduct, UserStickerPackModel) ||
		isInstance(purchasedProduct, StickerPackModel)
	) {
		return;
	}

	// Collectibles are based on non-User resources. We need to grab the actual
	// resource to get the correct ID.
	const product = isInstance(purchasedProduct, UserAvatarFrameModel)
		? purchasedProduct.avatar_frame
		: purchasedProduct;

	let type: CollectibleType | null = null;
	if (isInstance(product, AvatarFrameModel)) {
		type = CollectibleType.AvatarFrame;
	} else if (isInstance(product, BackgroundModel)) {
		type = CollectibleType.Background;
	} else if (isInstance(product, StickerModel)) {
		type = CollectibleType.Sticker;
	}
	if (!type) {
		return;
	}
	const collectible = getModel(CollectibleModel, `${type}:${product.id}`);
	if (collectible) {
		collectible.is_unlocked = true;
	}
}
