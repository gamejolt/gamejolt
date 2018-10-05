import View from '!view!./overview.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import {
	Ads,
	AdSettingsContainer,
} from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppAdPlacement } from '../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
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

	@RouteResolve({
		cache: true,
		lazy: true,
		deps: {},
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/discover/channels/overview/' + route.params.channel);
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);

		const adSettings = new AdSettingsContainer();
		adSettings.targeting = {
			channel: this.$route.params.channel.toLowerCase(),
		};
		Ads.setPageSettings(adSettings);
	}

	routed($payload: any, fromCache: boolean) {
		this.isLoaded = true;
		this.bestGames = Game.populate($payload.bestGames).slice(0, 6);
		this.hotGames = Game.populate($payload.hotGames).slice(0, 6);

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/discover/channels/posts/${this.channel}`,
			},
			$payload.posts,
			fromCache
		);
	}

	routeDestroy() {
		Ads.releasePageSettings();
	}
}
