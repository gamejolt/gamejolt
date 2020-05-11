import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { sleep } from '../../../utils/utils';
import { propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { AppTooltip } from '../../tooltip/tooltip';
import AppStickerCard from '../card/card.vue';
import AppStickerCardHidden from '../card/hidden/hidden.vue';
import { Sticker } from '../sticker.model';

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

	purchasedSticker: Sticker | null = null;

	isRevealing = false;
	isRevealed = false;
	showCollectControls = false;

	get canReveal() {
		return this.balance >= this.stickerCost;
	}

	get canBuyStickerAmount() {
		return Math.floor(this.balance / this.stickerCost);
	}

	@Emit('collect')
	emitCollect() {}

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

		this.emitCollect();
	}
}
