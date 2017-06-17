import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./overview.html';

import { ChannelsViewHelper } from '../../channels-view-helper';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { BeforeRouteEnter } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppAd } from '../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameGridPlaceholder } from '../../../../../components/game/grid/placeholder/placeholder';

@View
@Component({
	components: {
		AppAd,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppActivityFeed,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverChannelsViewOverview extends Vue {
	@Prop() channel: any;
	@Prop() shouldShowAds: boolean;

	isLoaded = false;
	bestGames: Game[] = [];
	hotGames: Game[] = [];
	feed: ActivityFeedContainer | null = null;

	Environment = Environment;
	Screen = Screen;

	@BeforeRouteEnter({ cache: true, lazy: true })
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/discover/channels/overview/' + route.params.channel,
		);
	}

	created() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed() {
		this.isLoaded = true;
		this.bestGames = Game.populate(this.$payload.bestGames);
		this.hotGames = Game.populate(this.$payload.hotGames);

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(
				FiresidePost.populate(this.$payload.posts),
				{
					type: 'Fireside_Post',
					url: `/web/discover/channels/posts/${this.channel}`,
				},
			);
		}

		ChannelsViewHelper.setDefaultMetaData(this.$route.params.channel);
	}
}
