import View from '!view!./overview.html?style=./overview.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppExpand } from 'game-jolt-frontend-lib/components/expand/expand';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder.styl';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { YoutubeChannel } from 'game-jolt-frontend-lib/components/youtube/channel/channel-model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { RouteAction, RouteState, RouteStore } from '../profile.store';
import { AppGameList } from './../../../components/game/list/list';
import { AppGameListPlaceholder } from './../../../components/game/list/placeholder/placeholder';

@View
@Component({
	name: 'RouteProfileOverview',
	components: {
		AppExpand,
		AppFadeCollapse,
		AppGameList,
		AppGameListPlaceholder,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteProfileOverview extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteState
	user!: RouteStore['user'];

	@RouteState
	gamesCount!: RouteStore['gamesCount'];

	@RouteState
	videosCount!: RouteStore['videosCount'];

	@RouteState
	userFriendship!: RouteStore['userFriendship'];

	@RouteAction
	sendFriendRequest!: RouteStore['sendFriendRequest'];

	@RouteAction
	acceptFriendRequest!: RouteStore['acceptFriendRequest'];

	@RouteAction
	cancelFriendRequest!: RouteStore['cancelFriendRequest'];

	@RouteAction
	rejectFriendRequest!: RouteStore['rejectFriendRequest'];

	@RouteAction
	removeFriend!: RouteStore['removeFriend'];

	youtubeChannels: YoutubeChannel[] = [];
	showFullDescription = false;
	canToggleDescription = false;
	games: Game[] = [];

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/profile/overview/@' + route.params.username);
	}

	get routeTitle() {
		if (this.user) {
			return `${this.user.display_name} (@${this.user.username})`;
		}
		return null;
	}

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4';
	}

	get isBioLoaded() {
		return this.user && typeof this.user.description_compiled !== 'undefined';
	}

	get canAddAsFriend() {
		return (
			this.app.user &&
			this.user &&
			this.user.id !== this.app.user.id &&
			!this.userFriendship &&
			!this.user.is_verified
		);
	}

	get hasQuickButtonsSection() {
		return (
			this.canAddAsFriend ||
			(Screen.isMobile && (this.gamesCount > 0 || this.videosCount > 0))
		);
	}

	get hasLinksSection() {
		return (
			this.user &&
			(this.user.twitch_id ||
				this.user.twitter_id ||
				this.user.google_id ||
				this.user.web_site ||
				this.youtubeChannels.length > 0)
		);
	}

	get hasGamesSection() {
		return !Screen.isMobile && this.gamesCount > 0;
	}

	routed($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		this.showFullDescription = false;
		this.youtubeChannels = YoutubeChannel.populate($payload.youtubeChannels);
		this.games = Game.populate($payload.developerGamesTeaser);
	}
}
