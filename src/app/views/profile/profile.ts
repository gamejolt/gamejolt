import View from '!view!./profile.html?style=./profile.styl';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppPopper } from '../../../lib/gj-lib-client/components/popper/popper';
import { ReportModal } from '../../../lib/gj-lib-client/components/report/modal/modal.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserFollowWidget } from '../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { AppUserAvatar } from '../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { IntentService } from '../../components/intent/intent.service';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppUserDogtag } from '../../components/user/dogtag/dogtag';
import { Store, store } from '../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './profile.store';

@View
@Component({
	name: 'RouteProfile',
	components: {
		AppPageHeader,
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
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { params: ['username'], query: ['intent'] },
	async resolver({ route }) {
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
	},
	resolveStore({ payload }) {
		routeStore.commit('profilePayload', payload);

		const user = routeStore.state.user;
		if (user) {
			store.commit('theme/setPageTheme', user.theme || null);
		}
	},
})
export default class RouteProfile extends BaseRouteComponent {
	@Prop(String)
	username!: string;

	@State
	app!: Store['app'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	videosCount!: RouteStore['videosCount'];

	@RouteStoreModule.State
	isOnline!: RouteStore['isOnline'];

	@RouteStoreModule.State
	userFriendship!: RouteStore['userFriendship'];

	@RouteStoreModule.Mutation
	bootstrapUser!: RouteStore['bootstrapUser'];

	@RouteStoreModule.Mutation
	profilePayload!: RouteStore['profilePayload'];

	@RouteStoreModule.Action
	removeFriend!: RouteStore['removeFriend'];

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

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.bootstrapUser(this.$route.params.username);

		const adSettings = new AdSettingsContainer();
		adSettings.adUnit = 'devprofile';
		Ads.setPageSettings(adSettings);
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
