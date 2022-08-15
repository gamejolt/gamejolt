import { Model } from '../model/model.service';

/**
 * Returned from backend when representing a collection of the same sticker.
 */
export type StickerStack = {
	sticker_id: number;
	count: number;
	sticker: Sticker;
};

export class Sticker extends Model {
	public static readonly RARITY_COMMON = 0;
	public static readonly RARITY_UNCOMMON = 1;
	public static readonly RARITY_RARE = 2;
	public static readonly RARITY_EPIC = 3;

	rarity!: number;
	img_url!: string;
	is_event!: boolean;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(Sticker);
