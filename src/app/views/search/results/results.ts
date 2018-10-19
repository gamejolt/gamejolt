import View from '!view!./results.html?style=./results.styl';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { Search } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@View
@Component({
	name: 'RouteSearchResults',
	components: {
		AppUserAvatar,
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

	feed: ActivityFeedContainer | null = null;

	readonly Search = Search;
	readonly Screen = Screen;

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/search/${this.$route.query.q}`,
			},
			$payload.posts,
			fromCache
		);
	}
}
