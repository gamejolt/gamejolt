import Component from 'vue-class-component';
import { numberSort } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { number } from '../../../../../_common/filters/number';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppStickerCard from '../../../../../_common/sticker/card/card.vue';
import { Sticker } from '../../../../../_common/sticker/sticker.model';
import { InitPayload, StickerCount } from '../stickers';

@Component({
	name: 'RouteDashStickersOverview',
	components: {
		AppStickerCard,
		AppProgressBar,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/stickers/dash'),
})
export default class RouteDashStickersOverview extends BaseRouteComponent {
	readonly Screen = Screen;
	readonly number = number;

	value = 0;
	stickerCollection: StickerCount[] = [];
	stickerCost = 10;

	get routeTitle() {
		return this.$gettext(`Your Stickers`);
	}

	get hasStickersInCollection() {
		return this.stickerCollection.length > 0;
	}

	get stickerProgress() {
		let progress = this.value;
		while (progress >= this.stickerCost) {
			progress -= this.stickerCost;
		}
		return (progress / this.stickerCost) * 100;
	}

	get stickersBuyableAmount() {
		return Math.floor(this.value / this.stickerCost);
	}

	routeResolved($payload: InitPayload) {
		this._initData($payload);
	}

	private _initData($payload: InitPayload) {
		this.value = $payload.value;
		this.stickerCost = $payload.stickerCost;

		this.stickerCollection = [];
		for (const stickerCountPayload of $payload.stickerCounts) {
			const stickerData = $payload.stickers.find(i => i.id == stickerCountPayload.sticker_id);
			const stickerCount = {
				count: parseInt(stickerCountPayload.count, 10),
				sticker_id: parseInt(stickerCountPayload.sticker_id, 10),
				sticker: new Sticker(stickerData),
			} as StickerCount;
			this.stickerCollection.push(stickerCount);
		}
		this.stickerCollection.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));
	}
}
