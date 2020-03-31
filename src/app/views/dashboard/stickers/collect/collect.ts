import { Component } from 'vue-property-decorator';
import { sleep } from '../../../../../utils/utils';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { Growls } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppStickerCard from '../../../../../_common/sticker/card/card.vue';
import AppStickerCardHidden from '../../../../../_common/sticker/card/hidden/hidden.vue';
import { Sticker } from '../../../../../_common/sticker/sticker.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { InitPayload } from '../stickers';

@Component({
	name: 'RouteDashStickersCollect',
	components: {
		AppStickerCard,
		AppStickerCardHidden,
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/stickers/dash'),
})
export default class RouteDashStickersCollect extends BaseRouteComponent {
	readonly Screen = Screen;

	balance = 0;
	stickerCost = 10;
	purchasedSticker: Sticker | null = null;

	isRevealing = false;
	isRevealed = false;
	showCollectControls = false;

	get routeTitle() {
		return this.$gettext(`Collect Stickers`);
	}

	get canReveal() {
		return this.balance >= this.stickerCost;
	}

	routeResolved($payload: InitPayload) {
		this.balance = $payload.balance;
		this.stickerCost = $payload.stickerCost;
	}

	async onBuySticker() {
		this.isRevealing = true;

		let failed = false;

		// We want to at least wait a specified amount of time for the css animation to play.
		// If the Api request takes longer for some reason, we wait for that instead.
		await Promise.all([
			new Promise(async resolve => {
				try {
					const payload = await Api.sendRequest(
						'/web/stickers/acquire-sticker',
						{},
						{ detach: true }
					);
					if (!payload || !payload.stickers) {
						throw new Error('Failed to purchase sticker.');
					}
					const stickerData = payload.stickers[0];
					this.purchasedSticker = new Sticker(stickerData);
				} catch (error) {
					failed = true;
				}
				resolve();
			}),
			// Wait the 2s of the css animation +500ms just to have the shake animation go on for a little longer
			sleep(2500),
		]);

		if (failed) {
			Growls.error(this.$gettext(`Failed to purchase sticker.`));
		} else {
			this.isRevealed = true;

			setTimeout(() => {
				this.showCollectControls = true;
			}, 400 * (this.purchasedSticker!.rarity + 1));
		}

		this.isRevealing = false;
	}

	onClickCollect() {
		// Reset state
		this.isRevealed = false;
		this.isRevealing = false;
		this.showCollectControls = false;
		this.purchasedSticker = null;

		this.balance -= this.stickerCost;
	}
}
