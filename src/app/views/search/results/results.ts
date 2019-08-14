import { Component } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserCard from '../../../../_common/user/card/card.vue';
import { ActivityFeedService } from '../../activity/feed/feed-service';
import AppActivityFeed from '../../activity/feed/feed.vue';
import AppActivityFeedPlaceholder from '../../activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../activity/feed/view';
import AppGameGrid from '../../game/grid/grid.vue';
import AppGameList from '../../game/list/list.vue';
import AppPageContainer from '../../page-container/page-container.vue';
import { Search } from '../../search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

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
	resolver: ({ route }) => Search.search(route.query.q + ''),
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

	routeResolved($payload: any, fromCache: boolean) {
		// We bootstrap the feed from cache in the routeResolved method since
		// this page is not cached or lazy. We need this to get called after we
		// resolve the store with data.
		this.feed = ActivityFeedService.routeInit(this);
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/search/${encodeURIComponent(this.$route.query.q + '')}`,
				shouldShowFollow: true,
			},
			$payload.posts,
			fromCache
		);
	}
}
