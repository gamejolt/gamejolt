import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { numberSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { DrawerStore, DrawerStoreKey } from '../../../../_common/drawer/drawer-store';
import { number } from '../../../../_common/filters/number';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerCard from '../../../../_common/sticker/card/card.vue';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store } from '../../../store';

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

const FetchStickersEndpoint = '/web/stickers/dash';

@Component({
	name: 'RouteDashStickers',
	components: {
		AppPageHeader,
		AppStickerCard,
		AppProgressBar,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest(FetchStickersEndpoint),
})
export default class RouteDashStickers extends BaseRouteComponent {
	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	@State grid!: Store['grid'];

	readonly Screen = Screen;
	readonly number = number;

	balance = 0;
	stickerCollection: StickerCount[] = [];
	stickerCost = 10;

	get routeTitle() {
		return this.$gettext(`Your Stickers`);
	}

	get hasStickersInCollection() {
		return this.stickerCollection.length > 0;
	}

	get stickerProgress() {
		const progress = this.balance % this.stickerCost;
		return (progress / this.stickerCost) * 100;
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

	routeResolved($payload: InitPayload) {
		this.balance = $payload.balance;
		this.stickerCost = $payload.stickerCost;

		this.stickerCollection = [];
		for (const stickerCountPayload of $payload.stickerCounts) {
			const stickerData = $payload.stickers.find(
				i => i.id === stickerCountPayload.sticker_id
			);
			const stickerCount = {
				count: stickerCountPayload.count,
				sticker_id: stickerCountPayload.sticker_id,
				sticker: new Sticker(stickerData),
			} as StickerCount;
			this.stickerCollection.push(stickerCount);
		}
		this.stickerCollection.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));

		this.grid?.pushViewNotifications('stickers');
	}
}
