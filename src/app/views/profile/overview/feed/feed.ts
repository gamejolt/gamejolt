import View from '!view!./feed.html';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';
import { Store } from '../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../profile.store';

function getFetchUrl(route: Route) {
	const tab = route.query.tab || 'active';
	return `/web/posts/fetch/user/@${route.params.username}?tab=${tab}`;
}

@View
@Component({
	name: 'RouteProfileOverviewFeed',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppNavTabList,
		AppPostAddButton,
	},
})
@RouteResolver({
	cache: false,
	lazy: true,
	deps: { query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route))),
})
export default class RouteProfileOverviewFeed extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	feed: ActivityFeedView | null = null;

	get isOwner() {
		return this.app.user && this.user && this.user.id === this.app.user.id;
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
				shouldShowCommunityControls: true,
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
