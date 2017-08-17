import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../../components/activity/feed/feed-service';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';
import { RouteState, RouteStore } from '../../view.store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppActivityFeedLazy } from '../../../../../../components/lazy';

@View
@Component({
	name: 'RouteDiscoverGamesViewDevlogList',
	components: {
		AppAd,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteDiscoverGamesViewDevlogList extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	feed: ActivityFeedContainer | null = null;

	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/discover/games/devlog/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Devlog for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeInit() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed() {
		Meta.description = `Stay up to date on all the latest posts for ${this.game
			.title} on Game Jolt`;

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(FiresidePost.populate(this.$payload.posts), {
				type: 'Fireside_Post',
				url: `/web/discover/games/devlog/posts/${this.game.id}`,
			});
		}
	}
}
