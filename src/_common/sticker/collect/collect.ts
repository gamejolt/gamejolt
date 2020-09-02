import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { StickerCount } from '../../../app/views/dashboard/stickers/stickers';
import { numberSort } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { Ruler } from '../../ruler/ruler-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppStickerCard from '../card/card.vue';
import AppStickerCardHidden from '../card/hidden/hidden.vue';
import { Sticker } from '../sticker.model';

// Sync these up with '../card/variables.styl' - needed to calculate
// how many cards to show per row when redeeming multiple stickers.
const CARD_WIDTH = 150;
const CARD_MARGIN = 8;

@Component({
	components: {
		AppStickerCard,
		AppStickerCardHidden,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppStickerCollect extends Vue {
	@Prop(propRequired(Number)) balance!: number;
	@Prop(propRequired(Number)) stickerCost!: number;

	purchasedStickers: StickerCount[] = [];
	stickersPerRow = 5;
	showAll = false;

	isRevealing = false;
	isRevealed = false;
	showCollectControls = false;

	@Emit('redeem') emitRedeem(_count: number) {}
	@Emit('collect') emitCollect() {}

	mounted() {
		// Returns the amount of stickers to display per row so we don't have weird row wrapping.
		this.stickersPerRow = Math.floor(
			Ruler.width(this.$el as HTMLElement) / (CARD_WIDTH + CARD_MARGIN * 2)
		);
	}

	get canReveal() {
		// Returns 'false' if unable to purchase more and the user is not currently looking at purchased cards.
		return this.balance >= this.stickerCost || this.isRevealing || this.isRevealed;
	}

	get canBuyStickerAmount() {
		return Math.floor(this.balance / this.stickerCost);
	}

	get canBuyMultipleAmount() {
		// Capped at 20 stickers to limit requests.
		return Math.min(this.canBuyStickerAmount, 20);
	}

	get shownStickers() {
		if (this.showAll) {
			return this.purchasedStickers;
		}

		// Limit the shown stickers to a single row.
		return this.purchasedStickers.slice(0, this.stickersPerRow);
	}

	async onBuyStickers(count = 1) {
		this.isRevealing = true;

		let failed = false;

		// We want to at least wait a specified amount of time for the css animation to play.
		// If the Api request takes longer for some reason, we wait for that instead.
		await Promise.all([
			new Promise(async resolve => {
				try {
					const payload = await Api.sendRequest(
						`/web/stickers/acquire-stickers/${count}`,
						{},
						{ detach: true }
					);

					if (!payload || !payload.stickers || !payload.stickers.length) {
						throw new Error('Failed to purchase stickers.');
					}

					this.purchasedStickers = [];
					for (const stickerCountPayload of payload.stickerCounts) {
						const stickerData = payload.stickers.find(
							(i: Sticker) => i.id === stickerCountPayload.sticker_id
						);

						const stickerCount: StickerCount = {
							count: stickerCountPayload.count,
							sticker_id: stickerCountPayload.sticker_id,
							sticker: new Sticker(stickerData),
						};

						this.purchasedStickers.push(stickerCount);
					}

					this.purchasedStickers.sort((a, b) =>
						numberSort(b.sticker.rarity, a.sticker.rarity)
					);

					// Emit the count that was redeemed to update the 'balance'
					// prop, ensuring that canBuyMultipleAmount is accurate.
					this.emitRedeem(count);
				} catch (error) {
					failed = true;
				}
				resolve();
			}),
			// Wait the 2s of the css animation +500ms just to have the shake animation go on for a little longer
			sleep(2500),
		]);

		if (failed) {
			Growls.error(this.$gettext(`Failed to purchase stickers.`));
		} else {
			this.isRevealed = true;

			setTimeout(() => {
				this.showCollectControls = true;
			}, 400 * (this.purchasedStickers[0].sticker.rarity + 1));
		}

		this.isRevealing = false;
	}

	onClickRepeat(count: number) {
		this.onClickCollect();
		this.onBuyStickers(count);
	}

	onClickCollect() {
		// Reset state
		this.isRevealed = false;
		this.isRevealing = false;
		this.showCollectControls = false;
		this.purchasedStickers = [];
		this.showAll = false;

		this.emitCollect();
	}
}
