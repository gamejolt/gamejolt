import Component from 'vue-class-component';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';

export type InitPayload = {
	value: number;
	stickerCounts: StickerCountPayload[];
	stickers: any[];
	stickerCost: number;
};

type StickerCountPayload = {
	sticker_id: string;
	count: string;
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
	_coverMediaItem?: MediaItem;

	get coverMediaItem() {
		if (!this._coverMediaItem) {
			// Create fake media item resource to pass into the page header.
			const url = require('./background.png');
			this._coverMediaItem = new MediaItem({
				is_animated: false,
				width: 1240,
				height: 409,
				img_url: url,
				mediaserver_url: url,
			});
		}
		return this._coverMediaItem;
	}
}
