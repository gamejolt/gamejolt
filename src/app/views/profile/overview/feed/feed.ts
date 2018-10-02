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
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';
import { Store } from '../../../../store/index';
import { RouteState, RouteStore } from '../../profile.store';

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
export default class RouteProfileOverviewFeed extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteState
	user!: RouteStore['user'];

	feed: ActivityFeedContainer | null = null;

	get isOwner() {
		return this.app.user && this.user && this.user.id === this.app.user.id;
	}

	@RouteResolve({ cache: false, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(getFetchUrl(route));
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
			},
			$payload.items
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
