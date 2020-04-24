import { VuexStore } from '../../utils/vuex';
import { Growls } from '../growls/growls.service';
import { Model } from '../model/model.service';
import { appStore } from '../store/app-store';
import { StickerCollectModal } from './collect/modal/modal.service';

export function handleNewStickerNotification(title: string, message: string, store: VuexStore) {
	// Only show the growl when we haven't already notified the user of a new sticker.
	if (!appStore.state.hasNewStickers) {
		Growls.success({
			title,
			message,
			onclick: () => {
				store.commit('app/setHasNewStickers', false);
				StickerCollectModal.show();
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
