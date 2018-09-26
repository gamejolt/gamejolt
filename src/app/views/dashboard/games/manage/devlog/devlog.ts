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
import { Dictionary } from 'vue-router/types/router';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppPostAddButton } from '../../../../../components/post/add-button/add-button';
import { RouteState, RouteStore } from '../manage.store';

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
	const tab = getTab(route);
	return `/web/posts/fetch/game/${route.params.id}?tab=${tab}`;
}

@View
@Component({
	name: 'RouteDashGamesManageDevlog',
	components: {
		AppActivityFeed,
		AppPostAddButton,
		AppGamePerms,
		AppNavTabList,
	},
})
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	feed: ActivityFeedContainer = null as any;

	get tab() {
		return getTab(this.$route);
	}

	@RouteResolve({ cache: false, lazy: false, reloadOnQueryChange: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(getFetchUrl(route));
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routed($payload: any) {
		// Create a new activity feed container each time. Don't cache anything.
		this.feed = new ActivityFeedContainer(EventItem.populate($payload.items), {
			type: 'EventItem',
			url: getFetchUrl(this.$route),
		});
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

		if (this.$router.resolve(location).href === this.$route.fullPath) {
			this.reloadRoute();
		} else {
			this.$router.replace(location);
		}
	}
}
