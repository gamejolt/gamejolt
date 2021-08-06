import { Component } from 'vue-property-decorator';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import AppCommunityThumbnail from '../../../../_common/community/thumbnail/thumbnail.vue';
import { configHasSearchCommunities } from '../../../../_common/config/config.service';
import { number } from '../../../../_common/filters/number';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserCard from '../../../../_common/user/card/card.vue';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameList from '../../../components/game/list/list.vue';
import { AppActivityFeedLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/page-container.vue';
import { Search } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@Component({
	name: 'RouteSearchResults',
	components: {
		AppPageContainer,
		AppUserCard,
		AppGameList,
		AppGameGrid,
		AppCommunityThumbnail,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
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
	readonly number = number;

	get slicedUsers() {
		return Screen.isXs ? this.searchPayload.users : this.searchPayload.users.slice(0, 2);
	}

	get slicedCommunities() {
		return this.searchPayload.communities.slice(0, 6);
	}

	get showCommunities() {
		return configHasSearchCommunities.value;
	}

	routeCreated() {
		trackExperimentEngagement(configHasSearchCommunities);
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
				name: 'search',
				url: `/web/posts/fetch/search/${encodeURIComponent(this.$route.query.q + '')}`,
				shouldShowFollow: true,
				itemsPerPage: $payload.postsPerPage,
				shouldShowDates: false,
			},
			$payload.posts,
			fromCache
		);
	}
}
