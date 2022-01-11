import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../_common/api/api.service';
import { BlockModal } from '../../../_common/block/modal/modal.service';
import { CommentModal } from '../../../_common/comment/modal/modal.service';
import { Environment } from '../../../_common/environment/environment.service';
import { formatNumber } from '../../../_common/filters/number';
import AppPopper from '../../../_common/popper/popper.vue';
import { ReportModal } from '../../../_common/report/modal/modal.service';
import {
	BaseRouteComponent,
	RouteResolver,
	WithRouteStore,
} from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { copyShareLink } from '../../../_common/share/share.service';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserFollowWidget from '../../../_common/user/follow/widget.vue';
import { UserFriendship } from '../../../_common/user/friendship/friendship.model';
import AppUserAvatar from '../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../_common/user/verified-tick/verified-tick.vue';
import { ChatStore, ChatStoreKey } from '../../components/chat/chat-store';
import { isUserOnline } from '../../components/chat/client';
import { IntentService } from '../../components/intent/intent.service';
import AppPageHeaderControls from '../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../components/page-header/page-header.vue';
import AppUserBlockOverlay from '../../components/user/block-overlay/block-overlay.vue';
import AppUserDogtag from '../../components/user/dogtag/dogtag.vue';
import { Store, store } from '../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './profile.store';

const ProfileThemeKey = 'profile';

@Options({
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
		AppUserBlockOverlay,
	},
	directives: {
		AppTooltip,
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
				message: $gettext(`You're now following this user.`),
			},
			{
				intent: 'accept-friend-request',
				message: $gettext(`You are now friends with this user!`),
			},
			{
				intent: 'decline-friend-request',
				message: $gettext(`You've declined this user's friend request.`),
			}
		);
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/profile/@' + route.params.username);
	},
	resolveStore({ payload }) {
		routeStore.commit('profilePayload', payload);
	},
})
export default class RouteProfile extends BaseRouteComponent {
	themeStore = setup(() => useThemeStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	@State
	app!: Store['app'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	trophyCount!: RouteStore['trophyCount'];

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
	readonly formatNumber = formatNumber;

	get chat() {
		return this.chatStore.chat;
	}

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.user!.id;
	}

	get commentsCount() {
		if (this.user && this.user.comment_count) {
			return this.user.comment_count;
		}
		return 0;
	}

	get canBlock() {
		return (
			this.user && !this.user.is_blocked && this.app.user && this.user.id !== this.app.user.id
		);
	}

	get shouldShowFollow() {
		return (
			this.app.user &&
			this.user &&
			this.app.user.id !== this.user.id &&
			!this.user.is_blocked &&
			!this.user.blocked_you
		);
	}

	get shouldShowEdit() {
		return this.app.user && this.user && this.app.user.id === this.user.id;
	}

	get isOnline(): null | boolean {
		if (!this.chat || !this.user) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.bootstrapUser(this.$route.params.username.toString());
		this.setPageTheme();
	}

	routeResolved() {
		this.setPageTheme();
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(ProfileThemeKey);
	}

	private setPageTheme() {
		const theme = this.user?.theme ?? null;
		this.themeStore.setPageTheme({
			key: ProfileThemeKey,
			theme,
		});
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				model: this.user,
				displayMode: 'shouts',
			});
		}
	}

	copyShareUrl() {
		if (!this.user) {
			return;
		}
		const url = Environment.baseUrl + this.user.url;
		copyShareLink(url, 'user');
	}

	report() {
		if (this.user) {
			ReportModal.show(this.user);
		}
	}

	async blockUser() {
		if (this.user) {
			const result = await BlockModal.show(this.user);

			// Navigate away from the page after blocking.
			if (result) {
				this.$router.push({
					name: 'dash.account.blocks',
				});
			}
		}
	}
}
