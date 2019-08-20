import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Connection } from '../../../../_common/connection/connection-service';
import { Environment } from '../../../../_common/environment/environment.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Store } from '../../../store/index';
import { ChatClient } from '../../chat/client';
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
		AppTrackEvent,
	},
})
export default class AppShellTopNav extends Vue {
	@State
	app!: Store['app'];

	@State
	chat!: ChatClient;

	@State
	hasSidebar!: Store['hasSidebar'];

	@State
	hasCbar!: Store['hasCbar'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@Action
	toggleRightPane!: Store['toggleRightPane'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	moreMenuShowing = false;

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;
}
