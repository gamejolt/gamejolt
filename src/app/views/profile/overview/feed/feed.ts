import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/add-button.vue';
import AppUserSpawnDay from '../../../../components/user/spawn-day/spawn-day.vue';
import { Store } from '../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../profile.store';

function isLikeFeed(route: Route) {
	return route.params.feedSection === 'likes';
}

function getFetchUrl(route: Route) {
	const tab = route.query.tab || 'active';
	const feedType = isLikeFeed(route) ? 'user-likes' : 'user';
	return `/web/posts/fetch/${feedType}/@${route.params.username}?tab=${tab}`;
}

@Component({
	name: 'RouteProfileOverviewFeed',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppNavTabList,
		AppPostAddButton,
		AppUserSpawnDay,
	},
})
@RouteResolver({
	cache: false,
	lazy: true,
	deps: { params: ['feedSection'], query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route)), undefined, {
			// Don't error redirect here. It would go to 404 if the user is banned, and prevent us
			// from showing the "This user is banned" page.
			noErrorRedirect: true,
		}),
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

	get isLikeFeed() {
		return isLikeFeed(this.$route);
	}

	get showLikedFeed() {
		if (!this.user) {
			return false;
		}

		if (this.isOwner) {
			return true;
		}

		return this.user.liked_posts_enabled;
	}

	get isLikeFeedOwnerDisabled() {
		return this.isOwner && this.isLikeFeed && this.user && !this.user.liked_posts_enabled;
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'user-profile',
				url: getFetchUrl(this.$route),
				itemsPerPage: $payload.perPage,
				shouldShowDates: !this.isLikeFeed,
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
