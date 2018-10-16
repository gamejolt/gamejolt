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
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { Store } from '../../../store/index';
import { AppNotificationPopover } from '../../activity/notification-popover/notification-popover';
import { ChatClient } from '../../chat/client';
import { AppFriendRequestPopover } from '../../friend/request-popover/request-popover';
import { AppSearch } from '../../search/search';
import { AppShellAccountPopover } from '../account-popover/account-popover';

let components: any = {
	AppUserAvatarImg,
	AppPopper,
	AppShellAccountPopover,
	AppFriendRequestPopover,
	AppNotificationPopover,
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
	friendRequestCount!: Store['friendRequestCount'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@State
	hasSidebar!: Store['hasSidebar'];

	friendRequestsShowing = false;
	userMenuShowing = false;
	moreMenuShowing = false;

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;

	@Action
	toggleRightPane!: Store['toggleRightPane'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];
}
