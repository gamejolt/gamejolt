import View from '!view!./results.html?style=./results.styl';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { Search } from '../../../components/search/search-service';

@View
@Component({
	name: 'RouteSearchResults',
	components: {
		AppUserAvatar,
		AppGameGrid,
		AppJolticon,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
	filters: {
		number,
	},
})
export default class RouteSearchResults extends BaseRouteComponent {
	@Prop(Object)
	payload!: any;

	@Prop(String)
	query!: string;

	feed: ActivityFeedContainer | null = null;

	readonly Search = Search;
	readonly Screen = Screen;

	@RouteResolve({
		cache: true,
	})
	routeResolve(this: undefined, route: Route) {
		return Search.search(route.query.q);
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/search/${this.$route.query.q}`,
			},
			$payload.posts,
			fromCache
		);

		this.$emit('searchpayload', $payload);
	}
}
