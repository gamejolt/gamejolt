import Component from 'vue-class-component';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import { AppMutation, AppStore } from '../../../../_common/store/app-store';
import AppPageHeader from '../../../components/page-header/page-header.vue';

export type InitPayload = {
	balance: number;
	stickerCounts: StickerCountPayload[];
	stickers: any[];
	stickerCost: number;
};

type StickerCountPayload = {
	sticker_id: number;
	count: number;
};

export type StickerCount = {
	sticker_id: number;
	count: number;
	sticker: Sticker;
};

@Component({
	name: 'RouteDashStickers',
	components: {
		AppPageHeader,
	},
})
export default class RouteDashStickers extends BaseRouteComponent {
	@AppMutation
	setHasNewStickers!: AppStore['setHasNewStickers'];

	created() {
		this.setHasNewStickers(false);
	}

	get coverMediaItem() {
		// Create fake media item resource to pass into the page header.
		const url = require('./background.png');
		return new MediaItem({
			is_animated: false,
			width: 1240,
			height: 409,
			img_url: url,
			mediaserver_url: url,
		});
	}
}
