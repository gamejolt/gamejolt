import { Model } from '../model/model.service';

export class Sticker extends Model {
	public static readonly RARITY_COMMON = 0;
	public static readonly RARITY_UNCOMMON = 1;
	public static readonly RARITY_RARE = 2;
	public static readonly RARITY_EPIC = 3;

	rarity!: number;
	img_url!: string;
	is_type_halloween_candy!: boolean;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(Sticker);
