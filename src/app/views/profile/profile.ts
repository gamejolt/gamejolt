import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./profile.html?style=./profile.styl';

import { UserFriendship } from '../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatar } from '../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppPopover } from '../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppUserDogtag } from '../../components/user/dogtag/dogtag';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';
import { ReportModal } from '../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Store } from '../../store/index';
import { UserGameSession } from '../../../lib/gj-lib-client/components/user/game-session/game-session.model';
import { AppUserFollowWidget } from '../../../lib/gj-lib-client/components/user/follow-widget/follow-widget';
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { IntentService } from '../../components/intent/intent.service';
import { Translate } from '../../../lib/gj-lib-client/components/translate/translate.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

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
})
export default class RouteProfile extends BaseRouteComponent {
	@Prop(String) username: string;

	@State app: Store['app'];

	user: User | null = null;
	headerMediaItem: MediaItem | null = null;
	gamesCount = 0;
	videosCount = 0;
	isOnline = false;
	libraryGamesCount = 0;
	activeGameSession: UserGameSession | null = null;
	userFriendship: UserFriendship | null = null;

	UserFriendship = UserFriendship;
	Environment = Environment;

	@RouteResolve()
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'follow-user',
			message: Translate.$gettext(`You're now following this user.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/profile/@' + route.params.username);
	}

	routed($payload: any) {
		Ads.setAdUnit('devprofile');

		this.user = new User($payload.user);

		this.headerMediaItem = $payload.headerMediaItem
			? new MediaItem($payload.headerMediaItem)
			: null;
		this.gamesCount = $payload.gamesCount;
		this.isOnline = $payload.isOnline;
		this.libraryGamesCount = $payload.libraryGamesCount;
		this.activeGameSession = $payload.activeGameSession
			? new UserGameSession($payload.activeGameSession)
			: null;
		this.videosCount = $payload.videosCount || 0;

		if ($payload.userFriendship) {
			this.userFriendship = new UserFriendship($payload.userFriendship);
		}
	}

	acceptFriendRequest() {
		UserFriendshipHelper.acceptRequest(this.userFriendship!);
	}

	async sendFriendRequest() {
		this.userFriendship = await UserFriendshipHelper.sendRequest(this.user!);
	}

	async cancelFriendRequest() {
		if (!await UserFriendshipHelper.cancelRequest(this.userFriendship!)) {
			return;
		}
		this.userFriendship = null;
	}

	async rejectFriendRequest() {
		if (!await UserFriendshipHelper.rejectRequest(this.userFriendship!)) {
			return;
		}
		this.userFriendship = null;
	}

	async removeFriend() {
		if (!await UserFriendshipHelper.removeFriend(this.userFriendship!)) {
			return;
		}
		this.userFriendship = null;
	}

	report() {
		ReportModal.show(this.user!);
	}
}
