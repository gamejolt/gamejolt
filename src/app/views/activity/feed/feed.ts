import View from '!view!./feed.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { numberSort } from 'game-jolt-frontend-lib/utils/array';
import { fuzzysearch } from 'game-jolt-frontend-lib/utils/string';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import { AppBroadcastCard } from '../../../components/broadcast-card/broadcast-card';
import { AppGameList } from '../../../components/game/list/list';
import { AppGameListPlaceholder } from '../../../components/game/list/placeholder/placeholder';
import { Store, store } from '../../../store';

type DashGame = {
	id: number;
	title: string;
	ownerName: string;
	createdOn: number;
};

@View
@Component({
	name: 'RouteActivityFeed',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppGameList,
		AppGameListPlaceholder,
		AppBroadcastCard,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Promise.all([
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
			Api.sendRequest('/web/discover'),
		]),
	resolveStore({ payload, fromCache }) {
		const [feedPlayload] = payload;

		// Don't set if from cache, otherwise it could reset to the cached count
		// when switching between tabs.
		if (!fromCache) {
			// We clear the notifications for the tab we are on, and load in
			// counts for the other tab.
			store.commit('setNotificationCount', { type: 'activity', count: 0 });
			store.commit('setNotificationCount', {
				type: 'notifications',
				count: feedPlayload.notificationsUnreadCount,
			});
		}
	},
})
export default class RouteActivityFeed extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	feed: ActivityFeedView | null = null;
	featuredGames: Game[] = [];
	latestBroadcast: FiresidePost | null = null;
	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;

	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettext(`Your Activity Feed`);
	}

	get hasGamesSection() {
		return this.games.length > 0;
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
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		const [feedPlayload, discoverPayload] = $payload;

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/dash/activity/more/activity`,
				notificationWatermark: feedPlayload.unreadWatermark,
				shouldShowGameInfo: true,
			},
			feedPlayload.items,
			fromCache
		);

		this.featuredGames = Game.populate(discoverPayload.games);
		if (discoverPayload.featuredItem) {
			this.featuredGames.unshift(new Game(discoverPayload.featuredItem.game));
		}

		this.latestBroadcast = feedPlayload.latestBroadcast
			? new FiresidePost(feedPlayload.latestBroadcast)
			: null;

		this.games = feedPlayload.games;
		this.games = this.games.sort((a, b) => numberSort(a.createdOn, b.createdOn)).reverse();
	}

	loadedNew() {
		this.setNotificationCount({ type: 'activity', count: 0 });
	}
}
