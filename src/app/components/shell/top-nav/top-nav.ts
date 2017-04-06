import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import * as View from '!view!./top-nav.html?style=./top-nav.styl';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppShellAccountPopover } from '../account-popover/account-popover';
import { AppFriendRequestPopover } from '../../friend/request-popover/request-popover';
import { AppRouterLink } from '../../router-link/router-link';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppSearch } from '../../search/search';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Mutations } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppRouterLink,
		AppUserAvatarImg,
		AppShellAccountPopover,
		AppFriendRequestPopover,
		AppSearch,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
		AppTrackEvent,
	}
})
export class AppShellTopNav extends Vue
{
	@State app: AppState;
	@State chat: any;
	@State notificationCount: number;

	@Getter isLeftPaneVisible: boolean;
	@Getter isRightPaneVisible: boolean;

	friendRequestCount = 0;
	friendRequestsShowing = false;
	userMenuShowing = false;

	Environment = Environment;
	Screen = makeObservableService( Screen );
	Connection = makeObservableService( Connection );

	@Mutation( Mutations.toggleRightPane )
	toggleRightPane: Function;

	@Mutation( Mutations.toggleLeftPane )
	toggleLeftPane: Function;
}
