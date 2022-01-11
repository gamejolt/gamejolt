import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppGamePlaylistAddToWidget from '../../../app/components/game-playlist/add-to-widget/add-to-widget.vue';
import AppGameCompatIcons from '../../../app/components/game/compat-icons/compat-icons.vue';
import AppGameFollowWidget from '../../../app/components/game/follow-widget/follow-widget.vue';
import AppGameModLinks from '../../../app/components/game/mod-links/mod-links.vue';
import { propOptional } from '../../../utils/vue';
import { formatCurrency } from '../../filters/currency';
import AppPopper from '../../popper/popper.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/inview.vue';
import { SettingAnimatedThumbnails } from '../../settings/settings.service';
import { AppStore } from '../../store/app-store';
import AppUserCardHover from '../../user/card/hover/hover.vue';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../user/verified-tick/verified-tick.vue';
import { Game } from '../game.model';
import AppGameThumbnailImg from '../thumbnail-img/thumbnail-img.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

@Options({
	components: {
		AppGameThumbnailImg,
		AppGameCompatIcons,
		AppPopper,
		AppGameModLinks,
		AppUserCardHover,
		AppUserAvatarImg,
		AppScrollInview,
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
		AppUserVerifiedTick,
	},
})
export default class AppGameThumbnail extends Vue {
	@Prop({ type: Object, required: true }) game!: Game;
	@Prop(propOptional(String)) linkTo?: string;
	@Prop(propOptional(Boolean, false)) hidePricing!: boolean;
	@Prop(propOptional(Boolean, false)) hideControls!: boolean;

	@State app!: AppStore;

	isBootstrapped = import.meta.env.SSR;
	isHydrated = import.meta.env.SSR;
	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;
	readonly Game = Game;

	get shouldShowControls() {
		// TODO(vue3): check this to see if the default check still works
		// Only show controls if they didn't override with their own.
		return !this.$slots.default && !this.hideControls;
	}

	get shouldAnimate() {
		return SettingAnimatedThumbnails.get() && this.isHydrated;
	}

	get url() {
		if (this.linkTo === 'dashboard') {
			return this.game.getUrl('dashboard');
		} else if (this.linkTo) {
			return this.linkTo;
		}

		return this.game.getUrl();
	}

	get isOwned() {
		return this.game.sellable && this.game.sellable.is_owned;
	}

	get sellableType() {
		return this.game.sellable && this.game.sellable.type;
	}

	get pricing() {
		if (this.game.sellable && Array.isArray(this.game.sellable.pricings)) {
			return this.game.sellable.pricings[0];
		}
	}

	get saleOldPricing() {
		if (this.game.sellable && Array.isArray(this.game.sellable.pricings)) {
			return this.game.sellable.pricings[1];
		}
	}

	get sale() {
		return this.pricing && this.pricing.promotional;
	}

	get salePercentageOff() {
		if (this.pricing && this.saleOldPricing) {
			return (
				((this.saleOldPricing.amount - this.pricing.amount) / this.saleOldPricing.amount) *
				100
			).toFixed(0);
		}
		return '';
	}

	get pricingAmount() {
		return this.pricing && formatCurrency(this.pricing.amount);
	}

	get oldPricingAmount() {
		return this.saleOldPricing && formatCurrency(this.saleOldPricing.amount);
	}

	get showModTools() {
		return this.app.user && this.app.user.isMod && !this.hideControls;
	}

	inView() {
		this.isBootstrapped = true;
		this.isHydrated = true;
	}

	outView() {
		this.isHydrated = false;
	}
}
