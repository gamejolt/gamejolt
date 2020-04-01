import { VueRouter } from 'vue-router/types/router';
import { Growls } from '../growls/growls.service';
import { Model } from '../model/model.service';

export function handleNewStickerNotification(title: string, message: string, router: VueRouter) {
	Growls.success({
		title,
		message,
		onclick: () => {
			router.push({
				name: 'dash.stickers.collect',
			});
		},
	});
}

export class Sticker extends Model {
	public static readonly RARITY_COMMON = 0;
	public static readonly RARITY_UNCOMMON = 1;
	public static readonly RARITY_RARE = 2;
	public static readonly RARITY_EPIC = 3;

	rarity!: number;
	img_url!: string;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(Sticker);
