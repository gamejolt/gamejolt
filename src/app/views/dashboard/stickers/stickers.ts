import Component from 'vue-class-component';
import { numberSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { number } from '../../../../_common/filters/number';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';

type InitPayload = {
	value: number;
	stickerCounts: StickerCountPayload[];
	stickers: any[];
	stickerCost: number;
};

type PurchasedSticker = {
	sticker: Sticker;
	revealed: boolean;
	id: string;
};

type StickerCountPayload = {
	sticker_id: string;
	count: string;
};

type StickerCount = {
	sticker_id: number;
	count: number;
	sticker: Sticker;
};

@Component({
	name: 'RouteDashStickers',
	components: {
		AppPageHeader,
		AppLoading,
		AppProgressBar,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/stickers/dash'),
})
export default class RouteDashStickers extends BaseRouteComponent {
	readonly Screen = Screen;
	readonly number = number;

	value = 0;
	stickerCollection: StickerCount[] = [];
	stickerCost = 10;

	// Shows the opening view. Also contains the purchasing loading.
	isOpening = false;
	// Before the purchase of a pack went through, this is true. Makes the loading animation appear.
	isPurchasing = false;
	// After clicking "collect", we hit the dash endpoint again to refresh data.
	// While the data is being fetched, this is true.
	isRefreshing = false;

	purchasedStickers: PurchasedSticker[] = [];

	get routeTitle() {
		return this.$gettext(`Your Stickers`);
	}

	get canCollect() {
		return this.purchasedStickers.every(i => i.revealed);
	}

	get shouldShowStickerCollection() {
		return this.stickerCollection.length > 0;
	}

	get displayValue() {
		return Math.max(0, this.value);
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

	getStickerRarityLabel(rarity: number) {
		switch (rarity) {
			case 0:
				return this.$gettext(`Common`);
			case 1:
				return this.$gettext(`Uncommon`);
			case 2:
				return this.$gettext(`Rare`);
			case 3:
				return this.$gettext(`Epic`);
		}
	}

	async onPurchaseStickers() {
		this.isOpening = true;
		this.isPurchasing = true;

		const amount = Math.min(3, this.stickersBuyableAmount);

		try {
			const payload = await Api.sendRequest(
				'/web/stickers/buy-stickers/' + amount.toString(),
				{},
				{ noErrorRedirect: true }
			);
			if (!payload || !payload.stickers) {
				throw new Error('Failed to purchase stickers.');
			}
			this.purchasedStickers = [];
			for (const stickerData of payload.stickers) {
				this.purchasedStickers.push({
					sticker: new Sticker(stickerData),
					revealed: false,
					id: Math.random().toString(),
				});
				this.purchasedStickers.sort((a, b) =>
					numberSort(a.sticker.rarity, b.sticker.rarity)
				);
			}
		} catch (error) {
			Growls.error(this.$gettext(`Failed to purchase stickers.`));
			this.isOpening = false;
		}
		this.isPurchasing = false;
	}

	onClickRevealSticker(purchasedStickerId: string) {
		const sticker = this.purchasedStickers.find(i => i.id === purchasedStickerId);
		if (sticker) {
			sticker.revealed = true;
		}
	}

	async onClickCollect() {
		if (this.isRefreshing) {
			return;
		}

		this.isRefreshing = true;
		this.isOpening = false;

		// Refresh page data.
		const payload = (await Api.sendRequest('/web/stickers/dash')) as InitPayload;
		this._initData(payload);

		this.isRefreshing = false;
		this.isOpening = false;
	}
}
