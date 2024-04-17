import { AvatarFrameModel } from '../avatar/frame.model';
import { BackgroundModel } from '../background/background.model';
import { FiresideModel } from '../fireside/fireside.model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { StickerPackModel } from '../sticker/pack/pack.model';
import { UserModel } from '../user/user.model';
import { SupporterMessageModel } from './message.model';

const RESOURCE_FIRESIDE_POST = 'Fireside_Post';
const RESOURCE_FIRESIDE = 'Fireside';
const RESOURCE_STICKER_PACK = 'Sticker_Pack';
const RESOURCE_AVATAR_FRAME = 'Avatar_Frame';
const RESOURCE_BACKGROUND = 'Background';

export const TYPE_CHARGED_STICKER = 'charged-sticker-placement';
export const TYPE_SHOP_PURCHASE = 'shop-purchase';

export type SupporterActionType = typeof TYPE_CHARGED_STICKER | typeof TYPE_SHOP_PURCHASE;

export class SupporterActionModel extends Model {
	// Note: the id of this model is not the id of the target resource for which
	// the support is showing, but the id of the support action resource. e.g.
	// UserChargeTransaction or Inventory_Shop_ProductPurchase.

	declare user: UserModel;
	declare type: SupporterActionType;
	declare added_on: number;
	declare message?: SupporterMessageModel;

	declare resource_type:
		| typeof RESOURCE_FIRESIDE_POST
		| typeof RESOURCE_FIRESIDE
		| typeof RESOURCE_STICKER_PACK
		| typeof RESOURCE_AVATAR_FRAME
		| typeof RESOURCE_BACKGROUND;

	declare post?: FiresidePostModel;
	declare fireside?: FiresideModel;
	declare shopProductResource?: AvatarFrameModel | StickerPackModel | BackgroundModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.message) {
			this.message = new SupporterMessageModel(data.message);
		}

		if (data.resource) {
			if (data.type === TYPE_CHARGED_STICKER) {
				if (this.resource_type === RESOURCE_FIRESIDE_POST) {
					this.post = new FiresidePostModel(data.resource);
				} else if (this.resource_type === RESOURCE_FIRESIDE) {
					this.fireside = new FiresideModel(data.resource);
				}
			} else if (data.type === TYPE_SHOP_PURCHASE) {
				if (this.resource_type === RESOURCE_STICKER_PACK) {
					this.shopProductResource = storeModel(StickerPackModel, data.resource);
				} else if (this.resource_type === RESOURCE_AVATAR_FRAME) {
					this.shopProductResource = storeModel(AvatarFrameModel, data.resource);
				} else if (this.resource_type === RESOURCE_BACKGROUND) {
					this.shopProductResource = storeModel(BackgroundModel, data.resource);
				}
			}

			delete (this as any).resource;
		}
	}

	get isThanked() {
		return !!this.message;
	}

	get isChargedSticker() {
		return this.type === TYPE_CHARGED_STICKER;
	}

	get isShopPurchase() {
		return this.type === TYPE_SHOP_PURCHASE;
	}
}
