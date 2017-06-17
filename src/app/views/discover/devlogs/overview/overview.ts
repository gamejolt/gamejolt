import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./overview.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { AppGameGridPlaceholder } from '../../../../components/game/grid/placeholder/placeholder';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		AppExpand,
		AppVideoEmbed,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverDevlogsOverview extends Vue {
	@State app: Store['app'];

	games: any[] = [];
	feed: ActivityFeedContainer | null = null;

	// Don't cache since every page load we pull new games in.
	@BeforeRouteEnter({ lazy: true })
	beforeRoute() {
		return Api.sendRequest('/web/discover/devlogs');
	}

	created() {
		Meta.title = 'Indie game devlogs';
		Meta.description =
			'Find the latest and greatest games in development and follow their devlog feeds!';

		Meta.fb.title = Meta.title;
		Meta.twitter.title = Meta.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		Meta.twitter.image = require('../social.png');

		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed() {
		this.games = Game.populate(this.$payload.games);

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(
				FiresidePost.populate(this.$payload.posts),
				{
					type: 'Fireside_Post',
					url: '/web/discover/devlogs/posts',
				},
			);
		}
	}
}
