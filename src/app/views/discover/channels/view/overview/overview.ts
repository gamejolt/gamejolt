import View from '!view!./overview.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Ads } from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppAdPlacement } from '../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { EventItem } from '../../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../../../components/game/grid/placeholder/placeholder';

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
	@Prop()
	channel!: any;

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
