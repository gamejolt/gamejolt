import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./overview.html';

import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameGridPlaceholder } from '../../../../../components/game/grid/placeholder/placeholder';
import { AppAdPlacement } from '../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { EventItem } from '../../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { Ads } from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverChannelsViewOverview',
	components: {
		AppAdPlacement,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppActivityFeed,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverChannelsViewOverview extends BaseRouteComponent {
	@Prop() channel!: any;

	isLoaded = false;
	bestGames: Game[] = [];
	hotGames: Game[] = [];
	feed: ActivityFeedContainer | null = null;

	Environment = Environment;
	Screen = Screen;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/discover/channels/overview/' + route.params.channel);
	}

	routeInit() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed($payload: any, fromCache: boolean) {
		this.isLoaded = true;
		this.bestGames = Game.populate($payload.bestGames).slice(0, 6);
		this.hotGames = Game.populate($payload.hotGames).slice(0, 6);

		if (!fromCache && !this.feed) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate($payload.posts), {
				type: 'EventItem',
				url: `/web/discover/channels/posts/${this.channel}`,
			});
		}

		Ads.globalTargeting = {
			channel: this.channel,
		};
	}
}
