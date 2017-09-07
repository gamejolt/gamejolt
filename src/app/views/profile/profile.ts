import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./profile.html?style=./profile.styl';

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
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';
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
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/profile/@' + route.params.username);
	}

	routed() {
		Ads.setAdUnit('devprofile');

		this.user = new User(this.$payload.user);

		this.headerMediaItem = this.$payload.headerMediaItem
			? new MediaItem(this.$payload.headerMediaItem)
			: null;
		this.gamesCount = this.$payload.gamesCount;
		this.isOnline = this.$payload.isOnline;
		this.libraryGamesCount = this.$payload.libraryGamesCount;
		this.activeGameSession = this.$payload.activeGameSession
			? new UserGameSession(this.$payload.activeGameSession)
			: null;
		this.videosCount = this.$payload.videosCount || 0;

		if (this.$payload.userFriendship) {
			this.userFriendship = new UserFriendship(this.$payload.userFriendship);
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
