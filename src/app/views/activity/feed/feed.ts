import View from '!view!./feed.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { AppBroadcastCard } from '../../../components/broadcast-card/broadcast-card';
import { AppGameList } from '../../../components/game/list/list';
import { AppGameListPlaceholder } from '../../../components/game/list/placeholder/placeholder';
import { Store } from '../../../store';

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
})
export default class RouteActivityFeed extends BaseRouteComponent {
	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	feed: ActivityFeedContainer | null = null;
	featuredGames: Game[] = [];
	latestBroadcast: FiresidePost | null = null;

	readonly Screen = Screen;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined) {
		return Promise.all([
			Api.sendRequest('/web/dash/activity/activity'),
			Api.sendRequest('/web/discover'),
		]);
	}

	get routeTitle() {
		return this.$gettext(`Your Activity Feed`);
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any, fromCache: boolean) {
		const [feedPlayload, discoverPayload] = $payload;

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/dash/activity/more/activity`,
				notificationWatermark: feedPlayload.unreadWatermark,
			},
			feedPlayload.items,
			fromCache
		);

		// Don't set if from cache, otherwise it could reset to the cached count
		// when switching between tabs.
		if (!fromCache) {
			// We clear the notifications for the tab we are on, and load in
			// counts for the other tab.
			this.setNotificationCount({ type: 'activity', count: 0 });
			this.setNotificationCount({
				type: 'notifications',
				count: feedPlayload.notificationsUnreadCount,
			});
		}

		this.featuredGames = Game.populate(discoverPayload.games);
		if (discoverPayload.featuredItem) {
			this.featuredGames.unshift(new Game(discoverPayload.featuredItem.game));
		}

		this.latestBroadcast = feedPlayload.latestBroadcast
			? new FiresidePost(feedPlayload.latestBroadcast)
			: null;
	}

	loadedNew() {
		this.setNotificationCount({ type: 'activity', count: 0 });
	}
}
