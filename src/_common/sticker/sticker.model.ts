import { EmojiModel } from '../emoji/emoji.model';
import { MediaItemModel } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
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

export class StickerModel extends Model {
	declare name?: string;
	declare rarity: number;
	declare img_url: string;
	declare is_event: boolean;
	declare is_secret?: boolean;
	declare is_active?: boolean;
	declare added_on?: number;
	declare media_item?: MediaItemModel;
	declare artist?: UserModel;
	declare owner_user?: UserModel;
	declare mastery?: number;
	declare emoji?: EmojiModel;

	constructor(data: any = {}) {
		super(data);

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
			this.emoji = new EmojiModel(data.emoji);
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
