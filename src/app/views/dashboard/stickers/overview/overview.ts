import Component from 'vue-class-component';
import { numberSort } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { number } from '../../../../../_common/filters/number';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppStickerCard from '../../../../../_common/sticker/card/card.vue';
import { StickerCollectModal } from '../../../../../_common/sticker/collect/modal/modal.service';
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
		let progress = this.balance % this.stickerCost;
		return (progress / this.stickerCost) * 100;
	}

	get stickersBuyableAmount() {
		return Math.floor(this.balance / this.stickerCost);
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
	}

	async onCollect() {
		const remainingBalance = await StickerCollectModal.show();
		this.balance = remainingBalance ?? 0;
	}
}
