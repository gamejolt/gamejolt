import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./overview.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { AppGameGridPlaceholder } from '../../../../components/game/grid/placeholder/placeholder';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { Store } from '../../../../store/index';
import { AppAdPlacement } from '../../../../../lib/gj-lib-client/components/ad/placement/placement';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverDevlogsOverview',
	components: {
		AppExpand,
		AppVideoEmbed,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppAdPlacement,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverDevlogsOverview extends BaseRouteComponent {
	@State app: Store['app'];

	games: any[] = [];
	feed: ActivityFeedContainer | null = null;

	// Don't cache since every page load we pull new games in.
	@RouteResolve({ lazy: true })
	routeResolve() {
		return Api.sendRequest('/web/discover/devlogs');
	}

	routeInit() {
		Meta.title = this.$gettext('Indie game devlogs');
		Meta.description =
			'Find the latest and greatest games in development and follow their devlog feeds!';

		Meta.fb.title = Meta.title;
		Meta.twitter.title = Meta.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		Meta.twitter.image = require('../social.png');

		// Try pulling feed from cache.
		if (!GJ_IS_SSR) {
			this.feed = ActivityFeedService.bootstrap();
			console.log('tried getting feed', this.feed);
		}
	}

	routed() {
		this.games = Game.populate(this.$payload.games);

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(FiresidePost.populate(this.$payload.posts), {
				type: 'Fireside_Post',
				url: '/web/discover/devlogs/posts',
			});
		}
	}
}
