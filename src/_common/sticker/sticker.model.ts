import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class Sticker extends Model {
	public static readonly RARITY_COMMON = 0;
	public static readonly RARITY_UNCOMMON = 1;
	public static readonly RARITY_RARE = 2;
	public static readonly RARITY_EPIC = 3;

	name!: string;
	rarity!: number;

	media_item!: MediaItem;
	artist!: User;

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (data.artist) {
			this.artist = new User(data.artist);
		}
	}
}

Model.create(Sticker);
