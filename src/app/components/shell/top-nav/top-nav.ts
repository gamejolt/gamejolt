import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Connection } from '../../../../_common/connection/connection-service';
import { Environment } from '../../../../_common/environment/environment.service';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import AppSearch from '../../search/search.vue';
import AppShellAccountPopover from '../account-popover/account-popover.vue';
import AppShellFriendRequestPopover from '../friend-request-popover/friend-request-popover.vue';
import AppShellNotificationPopover from '../notification-popover/notification-popover.vue';

let components: any = {
	AppPopper,
	AppShellAccountPopover,
	AppShellFriendRequestPopover,
	AppShellNotificationPopover,
	AppSearch,
	AppThemeSvg,
};

if (GJ_IS_CLIENT) {
	components.AppClientHistoryNavigator = require('../../../../_common/client/history-navigator/history-navigator.vue').default;
}

@Component({
	components,
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppShellTopNav extends Vue {
	@State app!: Store['app'];

	@State visibleContextPane!: Store['visibleContextPane'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@State hasSidebar!: Store['hasSidebar'];
	@State hasCbar!: Store['hasCbar'];
	@State unreadActivityCount!: Store['unreadActivityCount'];

	@Action toggleCbarMenu!: Store['toggleCbarMenu'];
	@Action toggleContextPane!: Store['toggleContextPane'];
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

	onContextButtonClicked() {
		// Toggle the cbar and context panes for mobile.
		if (Screen.isXs) {
			// JODO: This should toggle the entire to-be-made cbar/context pane component
			return this.toggleCbarMenu();
		}

		// If we're showing a left-pane, just clear the left pane and don't open a context pane.
		if (!!this.visibleLeftPane && !this.visibleContextPane) {
			// Passing no value will close any open left-panes.
			return this.toggleLeftPane();
		}

		this.toggleContextPane();
	}

	get contextPane() {
		return this.$route.meta.contextPane || 'context';
	}

	get shouldShowContextButton() {
		// We always want the context pane/sidebar showing on this breakpoint, so we don't need the button.
		if (Screen.isLg) {
			return false;
		}

		// Md and Sm breakpoints always show cbar when logged in,
		// so in this case we only care about the context pane of the route.
		if (!Screen.isXs) {
			return !!this.$route.meta.contextPane;
		}

		// Cbar doesn't show on Xs devices, so we want to show the button if there's either a
		// user logged in or a route context we can use so it works properly when not signed in.
		return !!this.$route.meta.contextPane || !!this.app.user;
	}

	get contextButtonText() {
		// JODO: For some reason, currently doesn't show properly since tooltip directive
		// is currently hiding tooltips that have their reference obscures.
		if (!!this.visibleLeftPane && !!this.visibleContextPane) {
			return this.$gettext(`Hide ${this.visibleLeftPane} and ${this.contextPane}`);
		}

		// 'Hide chat', 'Hide library'
		if (!!this.visibleLeftPane) {
			return this.$gettext(`Hide ${this.visibleLeftPane}`);
		}

		// 'Hide channels'
		if (!!this.visibleContextPane) {
			return this.$gettext(`Hide ${this.contextPane}`);
		}

		return this.$gettext(`Show ${this.contextPane}`);
	}

	get shouldShowSearch() {
		return !Screen.isXs && this.$route.name !== 'discover.communities';
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
