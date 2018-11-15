import View from '!view!./results-3col.html?style=./results-3col.styl';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppUserCard } from 'game-jolt-frontend-lib/components/user/card/card';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { AppGameList } from '../../../components/game/list/list';
import { AppPageContainer } from '../../../components/page-container/page-container';
import { Search } from '../../../components/search/search-service';
import { trackSearchPage3ColSplitTest } from '../../../components/split-test/split-test-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@View
@Component({
	name: 'RouteSearchResults',
	components: {
		AppPageContainer,
		AppUserCard,
		AppGameList,
		AppGameGrid,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	resolver: ({ route }) => Search.search(route.query.q),
	resolveStore({ route, payload }) {
		routeStore.commit('processPayload', { payload: payload, route: route });
	},
})
export default class RouteSearchResults extends BaseRouteComponent {
	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	query!: RouteStore['query'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	feed: ActivityFeedView | null = null;

	readonly Search = Search;
	readonly Screen = Screen;

	get slicedUsers() {
		return Screen.isXs ? this.searchPayload.users : this.searchPayload.users.slice(0, 2);
	}

	routeCreated() {
		trackSearchPage3ColSplitTest();
	}

	routeResolved($payload: any, fromCache: boolean) {
		// We bootstrap the feed from cache in the routeResolved method since
		// this page is not cached or lazy. We need this to get called after we
		// resolve the store with data.
		this.feed = ActivityFeedService.routeInit(this);
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/search/${encodeURIComponent(this.$route.query.q)}`,
				shouldShowGameInfo: true,
			},
			$payload.posts,
			fromCache
		);
	}
}
