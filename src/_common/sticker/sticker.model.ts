import { EmojiModel } from '~common/emoji/emoji.model';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { ModelStoreModel, storeModel } from '~common/model/model-store.service';
import { ShopProductCommonFields } from '~common/shop/product/product-model';
import { UserModel } from '~common/user/user.model';

/**
 * Returned from backend when representing a collection of the same sticker.
 */
export type StickerStack = {
	sticker_id: number;
	count: number | null;
	sticker: StickerModel;
};

export const StickerRarityCommon = 0;
export const StickerRarityUncommon = 1;
export const StickerRarityRare = 2;
export const StickerRarityEpic = 3;

export type StickerRarity =
	| typeof StickerRarityCommon
	| typeof StickerRarityUncommon
	| typeof StickerRarityRare
	| typeof StickerRarityEpic;

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
	declare is_animated: boolean;
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
			case StickerRarityUncommon:
				return '#1bb804';

			case StickerRarityRare:
				return '#18a5f2';

			case StickerRarityEpic:
				return '#ffbc56';

			default:
				return null;
		}
	}

	get rarityName() {
		switch (this.rarity) {
			case StickerRarityCommon:
				return 'Common';

			case StickerRarityUncommon:
				return 'Uncommon';

			case StickerRarityRare:
				return 'Rare';

			case StickerRarityEpic:
				return 'Epic';

			default:
				return '???';
		}
	}
}
