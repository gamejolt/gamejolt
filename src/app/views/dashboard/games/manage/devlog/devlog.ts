import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import AppActivityFeed from '../../../../../components/activity/feed/feed.vue';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import AppPostAddButton from '../../../../../components/post/add-button/add-button.vue';
import { RouteStore, RouteStoreModule } from '../manage.store';

function getFetchUrl(route: Route) {
	const tab = route.query.tab || 'active';
	return `/web/posts/fetch/game/${route.params.id}?tab=${tab}`;
}

@Component({
	name: 'RouteDashGamesManageDevlog',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppPostAddButton,
		AppGamePerms,
		AppNavTabList,
	},
})
@RouteResolver({
	cache: false,
	lazy: false,
	deps: { query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route))),
})
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	feed: ActivityFeedView | null = null;

	get tab() {
		return this.$route.query.tab || 'active';
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
				shouldShowEditControls: true,
			},
			$payload.items,
			fromCache
		);
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}

	onPostEdited(eventItem: EventItem) {
		ActivityFeedService.onPostEdited(eventItem, this);
	}

	onPostPublished(eventItem: EventItem) {
		ActivityFeedService.onPostPublished(eventItem, this);
	}

	onPostRemoved(eventItem: EventItem) {
		ActivityFeedService.onPostRemoved(eventItem, this);
	}
}
