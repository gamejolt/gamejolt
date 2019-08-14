import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { currency } from '../../../../vue/filters/currency';
import { filesize } from '../../../../vue/filters/filesize';
import { Analytics } from '../../../analytics/analytics.service';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import AppCard from '../../../card/card.vue';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { AppCountdown } from '../../../countdown/countdown';
import { EventBus, EventBusDeregister } from '../../../event-bus/event-bus.service';
import AppExpand from '../../../expand/expand.vue';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import { LinkedKey } from '../../../linked-key/linked-key.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Sellable } from '../../../sellable/sellable.model';
import { AppTimeAgo } from '../../../time/ago/ago';
import { AppTooltip } from '../../../tooltip/tooltip';
import { User } from '../../../user/user.model';
import { GameBuild } from '../../build/build.model';
import { GameDownloader } from '../../downloader/downloader.service';
import { Game } from '../../game.model';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import { GameRelease } from '../../release/release.model';
import { GamePackage } from '../package.model';
import { GamePackagePurchaseModal } from '../purchase-modal/purchase-modal.service';
import AppGamePackageCardButtons from './buttons.vue';
import { GamePackageCardModel } from './card.model';

@Component({
	components: {
		AppCard,
		AppTimeAgo,
		AppFadeCollapse,
		AppExpand,
		AppCountdown,
	},
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		currency,
		filesize,
	},
})
export default class AppGamePackageCard extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(GamePackage)
	package!: GamePackage;

	@Prop(Sellable)
	sellable!: Sellable;

	@Prop({ type: Array, default: () => [] })
	releases!: GameRelease[];

	@Prop({ type: Array, default: () => [] })
	builds!: GameBuild[];

	@Prop(String)
	accessKey?: string;

	@Prop(Boolean)
	isPartner?: boolean;

	@Prop(String)
	partnerKey?: string;

	@Prop(User)
	partner?: User;

	static hook = {
		meta: undefined as typeof Vue | undefined,
		buttons: undefined as typeof Vue | undefined,
	};

	showFullDescription = false;
	canToggleDescription = false;

	isWhatOpen = false;
	pricing: SellablePricing | null = null;
	sale = false;
	salePercentageOff = '';
	saleOldPricing: SellablePricing | null = null;

	providerIcons: { [provider: string]: string } = {
		steam: 'steam',
	};

	private showPaymentOptionsDeregister?: EventBusDeregister;

	readonly AppGamePackageCard = AppGamePackageCard;

	get metaComponent() {
		return AppGamePackageCard.hook.meta;
	}

	get buttonsComponent() {
		return AppGamePackageCard.hook.buttons || AppGamePackageCardButtons;
	}

	get card() {
		return new GamePackageCardModel(this.sellable, this.releases, this.builds, this.linkedKeys);
	}

	get isOwned() {
		// If there is a key on the package, then we should show it as being
		// "owned".
		if (this.accessKey) {
			return true;
		}

		return this.sellable && this.sellable.is_owned ? true : false;
	}

	get linkedKeys() {
		if (!this.sellable) {
			return [];
		}

		return this.sellable.linked_keys || [];
	}

	get canBuy() {
		return (
			this.sellable &&
			!this.isOwned &&
			(this.sellable.type === 'pwyw' || this.sellable.type === 'paid')
		);
	}

	created() {
		if (this.sellable && this.sellable.pricings.length > 0) {
			this.pricing = this.sellable.pricings[0];
			if (this.pricing.promotional) {
				this.saleOldPricing = this.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = (
					((this.saleOldPricing.amount - this.pricing.amount) /
						this.saleOldPricing.amount) *
					100
				).toFixed(0);
			}
		}

		// Event to be able to open up the payment form.
		this.showPaymentOptionsDeregister = EventBus.on(
			'GamePackageCard.showPaymentOptions',
			(pkg: GamePackage) => {
				// Ensure that the payment well opens with the correct build
				// for "skip paying".
				if (this.package.id === pkg.id) {
					this.showPayment(
						this.card.downloadableBuild ? this.card.downloadableBuild : null,
						false
					);
				}
			}
		);
	}

	destroyed() {
		if (this.showPaymentOptionsDeregister) {
			this.showPaymentOptionsDeregister();
			this.showPaymentOptionsDeregister = undefined;
		}
	}

	buildClick(build: GameBuild, fromExtraSection = false) {
		// For client, if they clicked in the "options" section, then skip
		// showing payment form. Just take them directly to site.
		if (GJ_IS_CLIENT && fromExtraSection) {
			this.doBuildClick(build, fromExtraSection);
		} else if (this.sellable.type === 'pwyw' && this.canBuy) {
			this.showPayment(build, fromExtraSection);
		} else {
			this.doBuildClick(build, fromExtraSection);
		}
	}

	private doBuildClick(build: GameBuild, fromExtraSection = false) {
		let operation = build.type === GameBuild.TYPE_DOWNLOADABLE ? 'download' : 'play';
		if (build.type === GameBuild.TYPE_ROM && fromExtraSection) {
			operation = 'download';
		}

		if (operation === 'download') {
			this.download(build);
		} else if (operation === 'play') {
			this.showBrowserModal(build);
		}
	}

	showPayment(build: GameBuild | null, fromExtraSection: boolean) {
		GamePackagePurchaseModal.show({
			game: this.game,
			package: this.package,
			build: build,
			fromExtraSection,
			partner: this.partner,
			partnerKey: this.partnerKey,
		});
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'download');

		GameDownloader.download(this.$router, this.game, build, {
			isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	private showBrowserModal(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'play');

		GamePlayModal.show(this.game, build, {
			// isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	copyProviderKey(key: LinkedKey) {
		Clipboard.copy(key.key);
	}
}
