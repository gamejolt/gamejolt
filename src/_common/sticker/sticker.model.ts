import { VueRouter } from 'vue-router/types/router';
import { store } from '../../app/store/index';
import { Growls } from '../growls/growls.service';
import { Model } from '../model/model.service';
import { appStore } from '../store/app-store';

export function handleNewStickerNotification(title: string, message: string, router: VueRouter) {
	// Only show the growl when we haven't already notified the user of a new sticker.
	if (!appStore.hasNewStickers) {
		Growls.success({
			title,
			message,
			onclick: () => {
				router.push({
					name: 'dash.stickers.collect',
				});
			},
		});

		store.commit('app/setHasNewStickers', true);
	}
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
