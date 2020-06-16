import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { sleep } from '../../../utils/utils';
import { propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppStickerCard from '../card/card.vue';
import AppStickerCardHidden from '../card/hidden/hidden.vue';
import { Sticker } from '../sticker.model';

// Using for testing
type StickerType = {
	id: number;
	rarity: number;
	img_url: string;
	count: number;
};

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

	// Need the total count of the stickers for balance deduction?
	purchasedStickersCount = 0;
	// Array of unique stickers that were purchased, with counts for duplicates.
	purchasedStickers: Sticker[] = [];
	// An array of the sticker IDs we already have in our purchasedStickers list.
	private uniqueStickers: Number[] = [];

	isRevealing = false;
	isRevealed = false;
	showCollectControls = false;

	get canReveal() {
		return this.balance >= this.stickerCost;
	}

	get canBuyStickerAmount() {
		return Math.floor(this.balance / this.stickerCost);
	}

	get canBuyMultipleAmount() {
		// Capped at 20 cards for testing
		return Math.min(this.canBuyStickerAmount, 20);
	}

	get shouldAnimateRarity() {
		// Don't want to make things laggy by playing too many animations.
		return this.uniqueStickers.length <= 8;
	}

	@Emit('collect')
	emitCollect(_count: number) {}

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
					if (!payload || !payload.stickers || !payload.stickers.length) {
						throw new Error('Failed to purchase sticker.');
					}
					const stickerData = payload.stickers[0];
					this.purchasedStickersCount = payload.stickers.length;

					this.purchasedStickers.push(new Sticker(stickerData));
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
			}, 400 * (this.purchasedStickers[0].rarity + 1));
		}

		this.isRevealing = false;
	}

	// Can probably consolidate this and the above into one.
	async onBuyMultiple(count: number) {
		/**
		 * Not sure how we'll do the API call for redeeming multiple.
		 *
		 * Maybe something like this?
		 * this.onBuySticker(this.canBuyMultipleAmount)
		 */

		this.isRevealing = true;

		let failed = false;

		await Promise.all([
			new Promise(async resolve => {
				try {
					// API related things
					// get the payload, currently treating as an array
					const payload = this._testingRandomizeStickers(count);
					this.purchasedStickersCount = payload.length;

					payload.forEach(sticker => {
						this._testingUpdateStickers(sticker);
					});
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
				// Should probably figure out the highest rarity card and set the delay to that.
				// Manually setting delay to assume at least one card is 'Epic'.
			}, 400 * 4);
		}

		this.isRevealing = false;
	}

	_testingUpdateStickers(sticker: StickerType) {
		// Ran for every sticker in the payload to
		// correctly get the counts for each sticker.
		if (!this.uniqueStickers.includes(sticker.id)) {
			this.uniqueStickers.push(sticker.id);
			return this.purchasedStickers.push(new Sticker(sticker));
		}

		this.purchasedStickers.find(item => {
			if (item.id === sticker.id) {
				return item.count++;
			}
		});
	}

	_testingRandomizeStickers(count: number) {
		// Create random stickers using consistent images, rarity, and id.
		let stickers: StickerType[] = [];

		for (let i = 0; i < count; i++) {
			const id = Math.round(Math.random() * 9);
			const rarity = Math.round(id / 3);
			const img_url = this._testingPotentialImages[id];

			stickers.push({
				id,
				rarity,
				img_url,
				count: 1,
			});
		}

		return stickers;
	}

	get _testingPotentialImages() {
		// Random sticker images for testing
		return [
			'https://m.gjcdn.net/sticker/200/16-tue43zip-v4.png',
			'https://m.gjcdn.net/sticker/200/6-hhjsbeah-v4.png',
			'https://m.gjcdn.net/sticker/200/14-ywzaei7i-v4.png',
			'https://m.gjcdn.net/sticker/200/18-ui4resdn-v4.png',
			'https://m.gjcdn.net/sticker/200/22-pn7sa8ws-v4.png',
			'https://m.gjcdn.net/sticker/200/4-xzt3d5as-v4.png',
			'https://m.gjcdn.net/sticker/200/8-btxgfvks-v4.png',
			'https://m.gjcdn.net/sticker/200/11-h7dti3rb-v4.png',
			'https://m.gjcdn.net/sticker/200/19-hjig7t4h-v4.png',
			'https://m.gjcdn.net/sticker/200/15-zvr4xpje-v4.png',
		];
	}

	onClickCollect(count: number) {
		// Reset state
		this.isRevealed = false;
		this.isRevealing = false;
		this.showCollectControls = false;
		this.purchasedStickers = [];

		this.emitCollect(count);
	}
}
