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
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppShellAccountPopover } from '../account-popover/account-popover';
import { AppFriendRequestPopover } from '../../friend/request-popover/request-popover';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppSearch } from '../../search/search';
import { Store } from '../../../store/index';
import { ChatClient } from '../../chat/client';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

let components: any = {
	AppJolticon,
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
	@State app: Store['app'];
	@State chat: ChatClient;
	@State notificationCount: Store['notificationCount'];
	@State friendRequestCount: Store['friendRequestCount'];
	@State isLeftPaneVisible: Store['isLeftPaneVisible'];
	@State isRightPaneVisible: Store['isRightPaneVisible'];

	friendRequestsShowing = false;
	userMenuShowing = false;

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;

	@Action toggleRightPane: Store['toggleRightPane'];
	@Action toggleLeftPane: Store['toggleLeftPane'];

	get clientUpdateState() {
		if (!GJ_IS_CLIENT) {
			return 'none';
		}

		return (this.$store as Store).state.clientLibrary.clientUpdateStatus;
	}

	updateApply() {
		console.log('applying');
		if (GJ_IS_CLIENT && GJ_WITH_UPDATER) {
			console.log('client dispatch');
			(this.$store as Store).dispatch('clientLibrary/updateClient');
		}
	}
}
