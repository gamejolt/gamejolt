import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import View from '!view!./top-nav.html?style=./top-nav.styl';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppShellAccountPopover } from '../account-popover/account-popover';
import { AppFriendRequestPopover } from '../../friend/request-popover/request-popover';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppSearch } from '../../search/search';
import { Store } from '../../../store/index';
import { ChatClient } from '../../chat/client';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

let components: any = {
	AppUserAvatarImg,
	AppShellAccountPopover,
	AppFriendRequestPopover,
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
		AppPopoverTrigger,
		AppTrackEvent,
	},
})
export class AppShellTopNav extends Vue {
	@State app!: Store['app'];
	@State chat!: ChatClient;
	@State notificationCount!: Store['notificationCount'];
	@State friendRequestCount!: Store['friendRequestCount'];
	@State isLeftPaneVisible!: Store['isLeftPaneVisible'];
	@State isRightPaneVisible!: Store['isRightPaneVisible'];
	@State hasSidebar!: Store['hasSidebar'];

	friendRequestsShowing = false;
	userMenuShowing = false;

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;

	@Action toggleRightPane!: Store['toggleRightPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];
}
