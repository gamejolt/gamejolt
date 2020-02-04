import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../_common/api/api.service';
import { Clipboard } from '../../../_common/clipboard/clipboard-service';
import { CommentModal } from '../../../_common/comment/modal/modal.service';
import { Environment } from '../../../_common/environment/environment.service';
import { number } from '../../../_common/filters/number';
import AppPopper from '../../../_common/popper/popper.vue';
import { ReportModal } from '../../../_common/report/modal/modal.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { WithRouteStore } from '../../../_common/route/route-store';
import { Screen } from '../../../_common/screen/screen-service';
import { ThemeMutation, ThemeStore } from '../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { AppTooltip } from '../../../_common/tooltip/tooltip';
import { Translate } from '../../../_common/translate/translate.service';
import AppUserFollowWidget from '../../../_common/user/follow/widget.vue';
import { UserFriendship } from '../../../_common/user/friendship/friendship.model';
import AppUserAvatar from '../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../_common/user/verified-tick/verified-tick.vue';
import { IntentService } from '../../components/intent/intent.service';
import AppPageHeaderControls from '../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../components/page-header/page-header.vue';
import AppUserDogtag from '../../components/user/dogtag/dogtag.vue';
import { Store, store } from '../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './profile.store';

@Component({
	name: 'RouteProfile',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppTimeAgo,
		AppUserAvatar,
		AppUserDogtag,
		AppPopper,
		AppUserFollowWidget,
		AppUserVerifiedTick,
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
	@State
	app!: Store['app'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	videosCount!: RouteStore['videosCount'];

	@RouteStoreModule.State
	trophyCount!: RouteStore['trophyCount'];

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

	readonly UserFriendship = UserFriendship;
	readonly Environment = Environment;
	readonly Screen = Screen;

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

	get commentsCount() {
		if (this.user && this.user.comment_count) {
			return this.user.comment_count;
		}
		return 0;
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.bootstrapUser(this.$route.params.username);
	}

	routeDestroyed() {
		this.setPageTheme(null);
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				resource: 'User',
				resourceId: this.user.id,
				displayMode: 'shouts',
			});
		}
	}

	copyShareUrl() {
		if (!this.user) {
			return;
		}
		Clipboard.copy(Environment.baseUrl + this.user.url);
	}

	report() {
		if (this.user) {
			ReportModal.show(this.user);
		}
	}
}
