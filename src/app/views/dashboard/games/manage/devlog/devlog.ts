import View from '!view!./devlog.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../../components/activity/feed/placeholder/placeholder';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppPostAddButton } from '../../../../../components/post/add-button/add-button';
import { RouteState, RouteStore } from '../manage.store';

function getFetchUrl(route: Route) {
	const tab = route.query.tab || 'active';
	return `/web/posts/fetch/game/${route.params.id}?tab=${tab}`;
}

@View
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
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	feed: ActivityFeedContainer | null = null;

	get tab() {
		return this.$route.query.tab || 'active';
	}

	@RouteResolve({
		cache: false,
		lazy: false,
		deps: { query: ['tab'] },
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(getFetchUrl(route));
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
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
