import View from '!view!./list.html';
import { AppAd } from 'game-jolt-frontend-lib/components/ad/ad';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';
import { AppDevlogPostAddButton } from '../../../../../../components/devlog/post/add-button/add-button';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { AppActivityFeedLazy } from '../../../../../../components/lazy';
import { Store } from '../../../../../../store/index';
import {
	gameStoreCheckPostRedirect,
	RouteMutation,
	RouteState,
	RouteStore,
} from '../../view.store';

@View
@Component({
	name: 'RouteDiscoverGamesViewDevlogList',
	components: {
		AppAd,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppDevlogPostAddButton,
		AppGamePerms,
	},
})
export default class RouteDiscoverGamesViewDevlogList extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteState
	game!: RouteStore['game'];

	@RouteMutation
	addPost!: RouteStore['addPost'];

	feed: ActivityFeedContainer | null = null;

	readonly Screen = Screen;

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

	routed($payload: any, fromCache: boolean) {
		Meta.description = `Stay up to date on all the latest posts for ${
			this.game.title
		} on Game Jolt`;

		if (!fromCache && !this.feed) {
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
