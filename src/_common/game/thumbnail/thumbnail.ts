import View from '!view!./thumbnail.html?style=./thumbnail.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppGamePlaylistAddToWidget } from '../../../app/components/game-playlist/add-to-widget/add-to-widget';
import { AppGameCompatIcons } from '../../../app/components/game/compat-icons/compat-icons';
import { AppGameFollowWidget } from '../../../app/components/game/follow-widget/follow-widget';
import { AppGameModLinks } from '../../../app/components/game/mod-links/mod-links';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppPopover } from '../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollInview } from '../../../lib/gj-lib-client/components/scroll/inview/inview';
import { AppUserAvatarImg } from '../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppVideo } from '../../../lib/gj-lib-client/components/video/video';
import { arrayRemove } from '../../../lib/gj-lib-client/utils/array';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { currency } from '../../../lib/gj-lib-client/vue/filters/currency';
import { AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';
import { Settings } from '../../settings/settings.service';

/**
 * An array of all the thumbnails on the page.
 */
const thumbnails: AppGameThumbnail[] = [];

// We want to attach to the window focus/blur events globally so that we don't
// register so many events.
if (typeof window !== 'undefined') {
	window.addEventListener('focus', () => {
		thumbnails.forEach(i => (i.isWindowFocused = true));
	});

	window.addEventListener('blur', () => {
		thumbnails.forEach(i => (i.isWindowFocused = false));
	});
}

@View
@Component({
	components: {
		AppJolticon,
		AppGameThumbnailImg,
		AppGameCompatIcons,
		AppVideo,
		AppPopover,
		AppGameModLinks,
		AppUserAvatarImg,
		AppScrollInview,
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppGameThumbnail extends Vue {
	@Prop(Object) game: Game;
	@Prop(String) linkTo?: string;
	@Prop(Boolean) hidePricing?: boolean;

	@State app: AppStore;

	isBootstrapped = GJ_IS_SSR;
	isHydrated = GJ_IS_SSR;
	isThumbnailLoaded = GJ_IS_SSR;
	isWindowFocused = typeof document !== 'undefined' && document.hasFocus
		? document.hasFocus()
		: true;

	readonly Screen = Screen;

	get shouldShowControls() {
		// Only show controls if they didn't override with their own.
		return !this.$slots.default;
	}

	get shouldShowVideo() {
		// When the window is not focused, or when we're scrolling, we don't want to play videos.
		// This should speed up inactive tabs.
		return (
			this.game.thumbnail_media_item &&
			this.game.thumbnail_media_item.is_animated &&
			Screen.isDesktop &&
			!GJ_IS_SSR &&
			!!Settings.get('animated-thumbnails') &&
			this.isWindowFocused &&
			!Screen.isScrolling &&
			this.isHydrated
		);
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
				(this.saleOldPricing.amount - this.pricing.amount) /
				this.saleOldPricing.amount *
				100
			).toFixed(0);
		}
		return '';
	}

	get pricingAmount() {
		return this.pricing && currency(this.pricing.amount);
	}

	get oldPricingAmount() {
		return this.saleOldPricing && currency(this.saleOldPricing.amount);
	}

	get showModTools() {
		return this.app.user && this.app.user.isMod;
	}

	created() {
		thumbnails.push(this);
	}

	destroyed() {
		arrayRemove(thumbnails, i => i === this);
	}

	inView() {
		this.isBootstrapped = true;
		this.isHydrated = true;
	}

	outView() {
		this.isHydrated = false;
	}

	onThumbnailLoad() {
		this.isThumbnailLoaded = true;
	}
}
