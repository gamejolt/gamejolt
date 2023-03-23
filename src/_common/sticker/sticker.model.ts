import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

/**
 * Returned from backend when representing a collection of the same sticker.
 */
export type StickerStack = {
	sticker_id: number;
	count: number;
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
	}

	get isCreatorSticker() {
		return !!this.owner_user && this.owner_user.is_creator === true;
	}
}

Model.create(Sticker);
