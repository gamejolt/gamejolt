import { EmojiModel } from '../emoji/emoji.model';
import { MediaItemModel } from '../media-item/media-item-model';
import { ModelStoreModel, storeModel } from '../model/model-store.service';
import { ShopProductCommonFields } from '../shop/product/product-model';
import { UserModel } from '../user/user.model';

/**
 * Returned from backend when representing a collection of the same sticker.
 */
export type StickerStack = {
	sticker_id: number;
	count: number | null;
	sticker: StickerModel;
};

export const enum StickerRarity {
	Common = 0,
	Uncommon = 1,
	Rare = 2,
	Epic = 3,
}

export class StickerModel implements ModelStoreModel, ShopProductCommonFields {
	declare id: number;
	declare name: string;
	declare description: string | undefined;
	declare rarity: number;
	declare img_url: string;
	declare is_event: boolean;
	declare is_secret?: boolean;
	declare is_active?: boolean;
	declare media_item?: MediaItemModel;
	declare artist?: UserModel;
	declare owner_user?: UserModel;
	declare mastery?: number;
	declare emoji?: EmojiModel;

	// Shop fields
	declare is_premium: boolean;
	declare has_active_sale: boolean;
	declare was_approved: boolean;
	declare added_on: number | undefined;

	update(data: any) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}

		if (data.artist) {
			this.artist = new UserModel(data.artist);
		}

		if (data.owner_user) {
			this.owner_user = new UserModel(data.owner_user);
		}

		if (data.emoji) {
			this.emoji = storeModel(EmojiModel, data.emoji);
		}
	}

	get isCreatorSticker() {
		return !!this.owner_user && this.owner_user.is_creator === true;
	}

	get rarityColor() {
		switch (this.rarity) {
			case StickerRarity.Uncommon:
				return '#1bb804';

			case StickerRarity.Rare:
				return '#18a5f2';

			case StickerRarity.Epic:
				return '#ffbc56';

			default:
				return null;
		}
	}

	get rarityName() {
		switch (this.rarity) {
			case StickerRarity.Common:
				return 'Common';

			case StickerRarity.Uncommon:
				return 'Uncommon';

			case StickerRarity.Rare:
				return 'Rare';

			case StickerRarity.Epic:
				return 'Epic';

			default:
				return '???';
		}
	}
}
