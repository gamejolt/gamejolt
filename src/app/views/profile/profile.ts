import View from '!view!./profile.html?style=./profile.styl';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppPopper } from '../../../lib/gj-lib-client/components/popper/popper';
import { ReportModal } from '../../../lib/gj-lib-client/components/report/modal/modal.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserFollowWidget } from '../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { AppUserAvatar } from '../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { IntentService } from '../../components/intent/intent.service';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppUserDogtag } from '../../components/user/dogtag/dogtag';
import { Store } from '../../store';
import {
	RouteAction,
	RouteMutation,
	RouteState,
	RouteStore,
	RouteStoreName,
} from './profile.store';

@View
@Component({
	name: 'RouteProfile',
	components: {
		AppPageHeader,
		AppJolticon,
		AppTimeAgo,
		AppUserAvatar,
		AppUserDogtag,
		AppPopper,
		AppUserFollowWidget,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteProfile extends BaseRouteComponent {
	@Prop(String)
	username!: string;

	@State
	app!: Store['app'];

	@RouteState
	user!: RouteStore['user'];

	@RouteState
	headerMediaItem!: RouteStore['headerMediaItem'];

	@RouteState
	videosCount!: RouteStore['videosCount'];

	@RouteState
	isOnline!: RouteStore['isOnline'];

	@RouteState
	userFriendship!: RouteStore['userFriendship'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@RouteMutation
	bootstrapUser!: RouteStore['bootstrapUser'];

	@RouteMutation
	profilePayload!: RouteStore['profilePayload'];

	@RouteAction
	removeFriend!: RouteStore['removeFriend'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	UserFriendship = UserFriendship;
	Environment = Environment;

	get shouldShowFullCover() {
		return Screen.isXs || this.$route.name !== 'profile.post.view';
	}

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.user!.id + (this.shouldShowFullCover ? '-full' : '-collapsed');
	}

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

		const adSettings = new AdSettingsContainer();
		adSettings.adUnit = 'devprofile';
		Ads.setPageSettings(adSettings);
	}

	routed($payload: any) {
		this.profilePayload($payload);
		if (this.user) {
			this.setPageTheme(this.user.theme || null);
		}
	}

	routeDestroy() {
		this.setPageTheme(null);
		Ads.releasePageSettings();
	}

	report() {
		if (this.user) {
			ReportModal.show(this.user);
		}
	}
}
