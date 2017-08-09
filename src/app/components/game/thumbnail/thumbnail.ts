import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppGameCompatIcons } from '../compat-icons/compat-icons';
import { AppVideo } from '../../../../lib/gj-lib-client/components/video/video';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppGameModLinks } from '../mod-links/mod-links';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppScrollInview } from '../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { arrayRemove } from '../../../../lib/gj-lib-client/utils/array';
import { Settings } from '../../settings/settings.service';
import { AppGameThumbnailPlaceholder } from './placeholder/placeholder';
import { AppGameFollowWidget } from '../follow-widget/follow-widget';
import { AppGamePlaylistAddToWidget } from '../../game-playlist/add-to-widget/add-to-widget';

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
		AppGameThumbnailPlaceholder,
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
	@Prop(Boolean) autoplay?: boolean;
	@Prop(Boolean) hidePricing?: boolean;

	@State app: AppStore;

	isHovered = false;
	isBootstrapped = GJ_IS_SSR;
	isHydrated = GJ_IS_SSR;
	isThumbnailLoaded = GJ_IS_SSR;
	isWindowFocused = typeof document !== 'undefined' && document.hasFocus
		? document.hasFocus()
		: true;

	Screen = makeObservableService(Screen);

	get shouldShowControls() {
		// Only show controls if they didn't override with their own.
		return !this.$slots.default;
	}

	get isActive() {
		// When the window is not focused we don't want to play videos. This
		// should speed up inactive tabs.
		return (
			!GJ_IS_SSR &&
			!!Settings.get('animated-thumbnails') &&
			(this.isHovered || this.autoplay) &&
			this.isWindowFocused &&
			this.isHydrated
		);
	}

	get shouldShowVideo() {
		return (
			this.game.thumbnail_media_item &&
			this.game.thumbnail_media_item.is_animated &&
			Screen.isDesktop &&
			this.isActive
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
			return ((this.saleOldPricing.amount - this.pricing.amount) /
				this.saleOldPricing.amount *
				100).toFixed(0);
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
		return this.app.user && this.app.user.permission_level >= 3;
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
