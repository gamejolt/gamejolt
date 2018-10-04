import View from '!view!./overview.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppAdPlacement } from '../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../../components/game/grid/placeholder/placeholder';
import { Store } from '../../../../store/index';

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
	@State
	app!: Store['app'];

	games: any[] = [];
	feed: ActivityFeedContainer | null = null;

	// Don't cache since every page load we pull new games in.
	@RouteResolve({ lazy: true })
	routeResolve() {
		return Api.sendRequest('/web/discover/devlogs');
	}

	get routeTitle() {
		return this.$gettext('Indie game devlogs');
	}

	routeInit() {
		Meta.fb.title = this.routeTitle;
		Meta.twitter.title = this.routeTitle;

		Meta.description =
			'Find the latest and greatest games in development and follow their devlog feeds!';
		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		Meta.twitter.image = require('../social.png');

		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any, fromCache: boolean) {
		this.games = Game.populate($payload.games);

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: '/web/discover/devlogs/posts',
			},
			$payload.posts,
			fromCache
		);
	}
}
