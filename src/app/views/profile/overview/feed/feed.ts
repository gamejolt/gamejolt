import View from '!view!./feed.html';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Dictionary } from 'vue-router/types/router';
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

function getTab(route: Route) {
	return route.query.tab || 'active';
}

function getTabForPost(post: FiresidePost) {
	if (post.isScheduled) {
		return 'scheduled';
	} else if (post.isDraft) {
		return 'draft';
	}

	return 'active';
}

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

	feed: ActivityFeedContainer = null as any;

	get isOwner() {
		return this.app.user && this.user && this.user.id === this.app.user.id;
	}

	@RouteResolve({ lazy: true, reloadOnQueryChange: true })
	routeResolve(this: undefined, route: Route) {
		console.log('routeResolve');

		return Api.sendRequest(getFetchUrl(route));
	}

	routeInit() {
		console.log('routeInit');

		// Try pulling feed from cache.
		const feed = ActivityFeedService.bootstrap();
		if (feed) {
			this.feed = feed;
		}
	}

	routed($payload: any, fromCache: boolean) {
		console.log('routed ' + (fromCache ? 'from cache' : ''));
		console.log($payload);

		// This may have been bootstrapped from cache in the `bootstrapFeed`
		// mutation. If there was no cached feed, then we'll generate a new one.
		// Also regenerate if the game changed.
		if (!fromCache) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate($payload.items), {
				type: 'EventItem',
				url: getFetchUrl(this.$route),
			})!;
		}
	}

	private _postFromEventItem(eventItem: EventItem) {
		return eventItem.action as FiresidePost;
	}

	onPostAdded(post: FiresidePost) {
		if (!post.event_item) {
			throw new Error('Post was expected to have an event_item field after being added');
		}

		this.gotoPost(post);
		this.feed.prepend([post.event_item]);
	}

	onPostEdited(eventItem: EventItem) {
		const post = this._postFromEventItem(eventItem);
		this.gotoPost(post);
	}

	onPostPublished(eventItem: EventItem) {
		const post = this._postFromEventItem(eventItem);
		this.gotoPost(post);
	}

	onPostRemoved(_eventItem: EventItem) {
		// do nothing
	}

	private gotoPost(post: FiresidePost) {
		const tab = getTab(this.$route);
		const newTab = getTabForPost(post);

		// We always reload the scheduled posts page. Since it works based on a date that can change
		// we need to refresh the feed to properly sort everything agian.
		if (newTab !== 'scheduled' && tab === newTab) {
			return;
		}

		let query: Dictionary<string> = {};
		if (newTab !== 'active') {
			query = { tab: newTab };
		}

		const location = {
			name: this.$route.name,
			params: this.$route.params,
			query,
		};

		console.log('going to post');
		if (this.$router.resolve(location).href === this.$route.fullPath) {
			this.reloadRoute();
		} else {
			this.$router.replace(location);
		}
	}
}
