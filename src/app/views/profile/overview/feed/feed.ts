import { Options } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/illustration.vue';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
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

@Options({
	name: 'RouteProfileOverviewFeed',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppNavTabList,
		AppPostAddButton,
		AppUserSpawnDay,
		AppIllustration,
	},
	directives: {
		AppTooltip,
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
	@State app!: Store['app'];
	@RouteStoreModule.State user!: RouteStore['user'];

	feed: ActivityFeedView | null = null;

	get isOwner() {
		return this.app.user && this.user?.id === this.app.user.id;
	}

	get isLikeFeed() {
		return isLikeFeed(this.$route);
	}

	get isLikeFeedDisabled() {
		return this.user?.liked_posts_enabled === false;
	}

	get likeFeedTooltip() {
		if (!this.isLikeFeedDisabled) {
			return null;
		}

		return this.isOwner
			? this.$gettext(`You've made your liked posts private, so only you can see this.`)
			: this.$gettext(`This user has made their liked posts private.`);
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
				shouldShowFollow: this.isLikeFeed,
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
