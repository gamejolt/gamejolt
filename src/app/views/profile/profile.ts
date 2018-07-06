import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./profile.html?style=./profile.styl';

import { UserFriendship } from '../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatar } from '../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppPopover } from '../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppUserDogtag } from '../../components/user/dogtag/dogtag';
import { ReportModal } from '../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Store } from '../../store/index';
import { AppUserFollowWidget } from '../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { IntentService } from '../../components/intent/intent.service';
import { Translate } from '../../../lib/gj-lib-client/components/translate/translate.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../lib/gj-lib-client/components/theme/theme.store';
import { RouteMutation, RouteStore, RouteState, RouteStoreName } from './profile.store';
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	name: 'RouteProfile',
	components: {
		AppPageHeader,
		AppJolticon,
		AppTimeAgo,
		AppUserAvatar,
		AppUserDogtag,
		AppPopover,
		AppUserFollowWidget,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export default class RouteProfile extends BaseRouteComponent {
	@Prop(String) username: string;

	@State app: Store['app'];
	@RouteState user: RouteStore['user'];
	@RouteState headerMediaItem: RouteStore['headerMediaItem'];
	@RouteState videosCount: RouteStore['videosCount'];
	@RouteState isOnline: RouteStore['isOnline'];
	@RouteState userFriendship: RouteStore['userFriendship'];
	@ThemeMutation setPageTheme: ThemeStore['setPageTheme'];
	@RouteMutation bootstrapUser: RouteStore['bootstrapUser'];
	@RouteMutation profilePayload: RouteStore['profilePayload'];
	@RouteMutation removeFriend: RouteStore['removeFriend'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	UserFriendship = UserFriendship;
	Environment = Environment;

	@RouteResolve({ cache: true, lazy: true })
	async routeResolve(this: undefined, route: Route) {
		const intentRedirect = IntentService.checkRoute(
			route,
			{
				intent: 'follow-user',
				message: Translate.$gettext(`You're now following this user.`),
			},
			{
				intent: 'accept-friend-request',
				message: Translate.$gettext(`You are now friends with this user!`),
			},
			{
				intent: 'decline-friend-request',
				message: Translate.$gettext(`You've declined this user's friend request.`),
			}
		);
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/profile/@' + route.params.username);
	}

	routeInit() {
		this.bootstrapUser(this.$route.params.username);
		Ads.setAdUnit('devprofile');
	}

	routed($payload: any) {
		this.profilePayload($payload);
		if (this.user) {
			this.setPageTheme(this.user.theme || null);
		}
	}

	routeDestroy() {
		this.setPageTheme(null);
	}

	report() {
		if (this.user) {
			ReportModal.show(this.user);
		}
	}
}
