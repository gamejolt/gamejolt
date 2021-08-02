import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { shouldShowAppPromotion } from '../../../../utils/mobile-app';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import { AppConfigLoaded } from '../../../../_common/config/loaded';
import { Connection } from '../../../../_common/connection/connection-service';
import { Environment } from '../../../../_common/environment/environment.service';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey } from '../../chat/client';
import AppSearch from '../../search/search.vue';

const components: any = {
	AppPopper,
	AppShellAccountPopover: () => import('../account-popover/account-popover.vue'),
	AppShellFriendRequestPopover: () =>
		import('../friend-request-popover/friend-request-popover.vue'),
	AppShellNotificationPopover: () => import('../notification-popover/notification-popover.vue'),
	AppSearch,
	AppThemeSvg,
	AppConfigLoaded,
};

if (GJ_IS_CLIENT) {
	components.AppClientHistoryNavigator =
		require('../../../../_common/client/history-navigator/history-navigator.vue').default;
}

@Component({
	components,
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppShellTopNav extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	@State app!: Store['app'];

	@State visibleLeftPane!: Store['visibleLeftPane'];
	@State hasSidebar!: Store['hasSidebar'];
	@State hasCbar!: Store['hasCbar'];
	@State unreadActivityCount!: Store['unreadActivityCount'];

	@Action toggleCbarMenu!: Store['toggleCbarMenu'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	moreMenuShowing = false;
	baseMinColWidth: number | null = null;

	$refs!: {
		left: HTMLDivElement;
		right: HTMLDivElement;
	};

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;
	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;
	readonly trackAppPromotionClick = trackAppPromotionClick;

	get isTimedOut() {
		return this.app.isUserTimedOut;
	}

	get shouldShowSearch() {
		return !Screen.isXs && this.$route.name !== 'discover.communities' && !this.isTimedOut;
	}

	get shouldShowMenu() {
		return Screen.isXs && !this.isTimedOut;
	}

	get shouldShowExplore() {
		return !Screen.isXs && this.app.user && !this.isTimedOut;
	}

	get shouldShowMoreMenu() {
		return !Screen.isXs && !this.isTimedOut;
	}

	get shouldShowAppPromotion() {
		return shouldShowAppPromotion(this.$route);
	}

	get humanizedActivityCount() {
		return this.unreadActivityCount < 100 ? this.unreadActivityCount : '99+';
	}

	get minColWidth() {
		// When we are smaller than this, we just set the search to stretch
		// full-width with a max-width. It mostly looks fine on sizes smaller
		// than this.
		if (Screen.width < 1300) {
			return null;
		}

		return this.baseMinColWidth && this.baseMinColWidth + 'px';
	}

	// Every time either the left or right column's dimensions changes, we run
	// this function.
	checkColWidths() {
		const left = (this.$refs.left && this.$refs.left.getBoundingClientRect().width) || 0;
		const right = (this.$refs.right && this.$refs.right.getBoundingClientRect().width) || 0;

		// We want to size both columns to be the same width, so choose the
		// largest among them.
		let max = Math.max(left, right);
		if (!max) {
			this.baseMinColWidth = null;
			return;
		}

		// Page content is centered within a column that is offset by the cbar (value of $shell-cbar-width),
		// so this does the same offseting within the top nav for the search bar
		// to align properly in the center with the page content.
		if (this.hasCbar) {
			max -= 70;
		}

		this.baseMinColWidth = max;
	}
}
