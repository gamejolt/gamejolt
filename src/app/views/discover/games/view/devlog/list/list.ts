import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./list.html';

import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../../components/activity/feed/feed-service';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';
import {
	RouteState,
	RouteStore,
	RouteMutation,
	gameStoreCheckPostRedirect,
} from '../../view.store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppActivityFeedLazy } from '../../../../../../components/lazy';
import { EventItem } from '../../../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { AppDevlogPostAdd } from '../../../../../../components/devlog/post/add/add';
import { Store } from '../../../../../../store/index';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';

@View
@Component({
	name: 'RouteDiscoverGamesViewDevlogList',
	components: {
		AppAd,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppDevlogPostAdd,
		AppGamePerms,
	},
})
export default class RouteDiscoverGamesViewDevlogList extends BaseRouteComponent {
	@State app: Store['app'];

	@RouteState game: RouteStore['game'];
	@RouteMutation addPost: RouteStore['addPost'];

	feed: ActivityFeedContainer | null = null;

	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
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

	routed($payload: any) {
		Meta.description = `Stay up to date on all the latest posts for ${
			this.game.title
		} on Game Jolt`;

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate($payload.posts), {
				type: 'EventItem',
				url: `/web/discover/games/devlog/posts/${this.game.id}`,
			});
		}
	}

	onPostAdded(post: FiresidePost) {
		// This feed is different than the one in the game route store.
		if (gameStoreCheckPostRedirect(post, this.game)) {
			this.feed!.prepend([post]);
		}
	}
}
