import View from '!view!./overview.html';
import { Component, Prop } from 'vue-property-decorator';
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
	RouteResolver,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
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
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			ActivityFeedService.makeFeedUrl(
				route,
				'/web/discover/channels/overview/' + route.params.channel
			)
		),
})
export default class RouteDiscoverChannelsViewOverview extends BaseRouteComponent {
	@Prop()
	channel!: any;

	isLoaded = false;
	bestGames: Game[] = [];
	hotGames: Game[] = [];
	feed: ActivityFeedView | null = null;

	Environment = Environment;
	Screen = Screen;

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);

		const adSettings = new AdSettingsContainer();
		adSettings.targeting = {
			channel: this.$route.params.channel.toLowerCase(),
		};
		Ads.setPageSettings(adSettings);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.isLoaded = true;
		this.bestGames = Game.populate($payload.bestGames).slice(0, 6);
		this.hotGames = Game.populate($payload.hotGames).slice(0, 6);

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/discover/channels/posts/${this.channel}`,
				shouldShowGameInfo: true,
			},
			$payload.posts,
			fromCache
		);
	}

	routeDestroyed() {
		Ads.releasePageSettings();
	}
}
