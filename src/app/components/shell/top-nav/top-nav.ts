import View from '!view!./top-nav.html?style=./top-nav.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { ChatClient } from '../../chat/client';
import { AppSearch } from '../../search/search';
import { AppShellAccountPopover } from '../account-popover/account-popover';
import { AppShellFriendRequestPopover } from '../friend-request-popover/friend-request-popover';
import { AppShellNotificationPopover } from '../notification-popover/notification-popover';

let components: any = {
	AppPopper,
	AppShellAccountPopover,
	AppShellFriendRequestPopover,
	AppShellNotificationPopover,
	AppSearch,
	AppThemeSvg,
};

if (GJ_IS_CLIENT) {
	components = {
		...components,
		...require('../../../../_common/client/history-navigator/history-navigator'),
	};
}

@View
@Component({
	components,
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
})
export class AppShellTopNav extends Vue {
	@State
	app!: Store['app'];

	@State
	chat!: ChatClient;

	@State
	hasSidebar!: Store['hasSidebar'];

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
