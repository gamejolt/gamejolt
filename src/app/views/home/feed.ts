import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import AppAdWidget from '../../../_common/ad/widget/widget.vue';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Game } from '../../../_common/game/game.model';
import { AppLazyPlaceholder } from '../../../_common/lazy/placeholder/placeholder';
import { Meta } from '../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import AppUserCard from '../../../_common/user/card/card.vue';
import { User } from '../../../_common/user/user.model';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import AppBroadcastCard from '../../components/broadcast-card/broadcast-card.vue';
import AppCommunitySliderPlaceholder from '../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../components/community/slider/slider.vue';
import AppGameBadge from '../../components/game/badge/badge.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppPageContainer from '../../components/page-container/page-container.vue';
import AppPostAddButton from '../../components/post/add-button/add-button.vue';
import { Store } from '../../store';
import AppHomeRecommendedGame from './_recommended/game/game.vue';
import AppHomeRecommendedUsers from './_recommended/users/users.vue';

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

@Component({
	name: 'RouteActivityFeed',
	components: {
		AppPageContainer,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppBroadcastCard,
		AppCommunitySlider,
		AppCommunitySliderPlaceholder,
		AppPostAddButton,
		AppUserCard,
		AppScrollAffix,
		AppAdWidget,
		AppHomeRecommendedUsers,
		AppHomeRecommendedGame,
		AppGameBadge,
		AppLazyPlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Promise.all([
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
			Api.sendRequest('/web/dash/home'),
		]),
})
export default class RouteActivityFeed extends BaseRouteComponent {
	@State app!: Store['app'];
	@State communities!: Store['communities'];
	@State unreadActivityCount!: Store['unreadActivityCount'];
	@State grid!: Store['grid'];

	feed: ActivityFeedView | null = null;
	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;
	loadingRecommendedUsers = false; // Set to `true` while refreshing users.
	loadingRecommendedData = true;
	recommendedUsers: User[] = [];
	featuredGame: Game | null = null;

	readonly Screen = Screen;

	get hasGamesSection() {
		return this.games.length > 0 && Screen.isLg;
	}

	get hasGameFilter() {
		return this.games.length > 7;
	}

	get filteredGames() {
		if (this.gameFilterQuery !== '') {
			return this.games.filter(i => this.checkGameFilter(i));
		} else if (this.isShowingAllGames) {
			return this.games;
		}
		return this.games.slice(0, 7);
	}

	get isShowAllGamesVisible() {
		return !this.isShowingAllGames && this.games.length > 7 && this.gameFilterQuery === '';
	}

	get shouldShowRecommendedUsers() {
		return this.loadingRecommendedUsers || this.recommendedUsers.length > 0;
	}

	@Watch('unreadActivityCount', { immediate: true })
	onUnreadActivityCountChanged() {
		if (this.feed && this.unreadActivityCount > this.feed.newCount) {
			this.feed.newCount = this.unreadActivityCount;
		}
	}

	private checkGameFilter(game: DashGame) {
		let text = '';
		const search = this.gameFilterQuery.toLowerCase();

		text = game.title.toLowerCase();
		if (fuzzysearch(search, text)) {
			return true;
		}

		if (game.ownerName) {
			text = game.ownerName.toLowerCase();
			if (fuzzysearch(search, text)) {
				return true;
			}
		}

		return false;
	}

	routeCreated() {
		Meta.setTitle(null);
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved([feedPayload, homePayload]: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'activity',
				url: `/web/dash/activity/more/activity`,
				shouldShowFollow: true,
				notificationWatermark: feedPayload.unreadWatermark,
			},
			feedPayload.items,
			fromCache
		);

		this.games = (homePayload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		if (!fromCache) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	mounted() {
		this.loadRecommendedData();
	}

	onLoadedNew() {
		if (this.unreadActivityCount > 0) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	onLoadMore() {
		Analytics.trackPageview(undefined, true);
	}

	onPostAdded(post: FiresidePost) {
		if (this.app.user) {
			ActivityFeedService.onPostAdded(this.feed!, post, this);
		}
	}

	async refreshRecommendedUsers() {
		this.loadingRecommendedUsers = true;

		const payload = await Api.sendRequest('/web/dash/recommended/refresh', undefined, {
			detach: true,
		});
		if (payload && payload.users) {
			this.recommendedUsers = User.populate(payload.users);
		}

		this.loadingRecommendedUsers = false;
	}

	async loadRecommendedData() {
		this.loadingRecommendedData = true;

		const payload = await Api.sendRequest('/web/dash/recommended', undefined, { detach: true });
		if (payload) {
			if (payload.users) {
				this.recommendedUsers = User.populate(payload.users);
			}
			if (payload.featuredGame) {
				this.featuredGame = new Game(payload.featuredGame);
			}
		}

		this.loadingRecommendedData = false;
	}
}
