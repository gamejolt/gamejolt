import { Emoji } from '../emoji/emoji.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

/**
 * Returned from backend when representing a collection of the same sticker.
 */
export type StickerStack = {
	sticker_id: number;
	count: number | null;
	sticker: Sticker;
};

export class Sticker extends Model {
	public static readonly RARITY_BRONZE = 0;
	public static readonly RARITY_SILVER = 1;
	public static readonly RARITY_GOLD = 2;
	public static readonly RARITY_PLATINUM = 3;

	name?: string;
	rarity!: number;
	img_url!: string;
	is_event!: boolean;
	is_secret?: boolean;
	is_active?: boolean;
	added_on?: number;

	media_item?: MediaItem;
	artist?: User;
	owner_user?: User;

	mastery?: number;
	emoji?: Emoji;

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (data.artist) {
			this.artist = new User(data.artist);
		}

		if (data.owner_user) {
			this.owner_user = new User(data.owner_user);
		}

		if (data.emoji) {
			this.emoji = new Emoji(data.emoji);
		}
	}

	get isCreatorSticker() {
		return !!this.owner_user && this.owner_user.is_creator === true;
	}

	get rarityColor() {
		switch (this.rarity) {
			case Sticker.RARITY_SILVER:
				return '#1bb804';

			case Sticker.RARITY_GOLD:
				return '#18a5f2';

			case Sticker.RARITY_PLATINUM:
				return '#ffbc56';

			default:
				return null;
		}
	}

	get rarityName() {
		switch (this.rarity) {
			// TODO(reactions) rarity names.
			case Sticker.RARITY_SILVER:
				return 'Uncommon';

			case Sticker.RARITY_GOLD:
				return 'Rare';

			case Sticker.RARITY_PLATINUM:
				return 'Epic';

			default:
				return 'Common';
		}
	}
}

Model.create(Sticker);
