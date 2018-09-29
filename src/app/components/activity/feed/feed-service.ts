import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Dictionary } from 'vue-router/types/router';
import { ActivityFeedContainer, ActivityFeedContainerOptions } from './feed-container-service';
import { ActivityFeedInput } from './item-service';

/**
 * Number of states we will keep cached.
 * We will purge others out of the cache.
 */
const MaxCachedCount = 3;

interface ActivityFeedState {
	key?: string;
	href: string;
	container: ActivityFeedContainer;
}

function getTabForPost(post: FiresidePost) {
	if (post.isScheduled) {
		return 'scheduled';
	} else if (post.isDraft) {
		return 'draft';
	}

	return 'active';
}

function postFromEventItem(eventItem: EventItem) {
	return eventItem.action as FiresidePost;
}

export class ActivityFeedService {
	private static _states: ActivityFeedState[] = [];

	static routeInit(routeComponent: BaseRouteComponent) {
		// Try to pull the feed from cache if they are going back to this route. We don't want to
		// pull from cache if they go back and forth between feed tabs, though.
		if (!routeComponent.routeBootstrapped) {
			return this.bootstrapFeedFromCache();
		}
		return null;
	}

	static routed(
		feed: ActivityFeedContainer | null,
		options: ActivityFeedContainerOptions,
		items: any[]
	) {
		// If there is a feed pulled from cache in routeInit, we just use that.
		if (feed) {
			return feed;
		}

		// If we couldn't fetch a cached feed when routeInit was called, we should start fresh.
		return ActivityFeedService.bootstrapFeed(items, options);
	}

	static onPostAdded(
		feed: ActivityFeedContainer,
		post: FiresidePost,
		routeComponent: BaseRouteComponent
	) {
		if (!post.event_item) {
			throw new Error('Post was expected to have an event_item field after being added');
		}

		// If we are already on the feed page that we need to be, let's just insert the post into
		// the feed.
		if (!this.gotoPostFeedManage(post, routeComponent)) {
			feed.prepend([post.event_item]);
		}
	}

	static onPostEdited(eventItem: EventItem, routeComponent: BaseRouteComponent) {
		const post = postFromEventItem(eventItem);
		this.gotoPostFeedManage(post, routeComponent);
	}

	static onPostPublished(eventItem: EventItem, routeComponent: BaseRouteComponent) {
		const post = postFromEventItem(eventItem);
		this.gotoPostFeedManage(post, routeComponent);
	}

	static onPostRemoved(_eventItem: EventItem, _routeComponent: BaseRouteComponent) {
		// Do nothing.
	}

	/**
	 * Returns true if it went to a new page, or false if we were already on the page required.
	 */
	static gotoPostFeedManage(post: FiresidePost, routeComponent: BaseRouteComponent) {
		const route = routeComponent.$route;
		const router = routeComponent.$router;
		const tab = getTabForPost(post);

		let query: Dictionary<string> = {};
		if (tab !== 'active') {
			query = { tab: tab };
		}

		let name = 'profile.overview';
		let params: Dictionary<string> = {
			username: post.user.username,
		};

		if (post.game) {
			name = 'dash.games.manage.devlog';
			params = {
				id: post.game.id + '',
			};
		}

		const location = {
			name,
			query,
			params,
		};

		if (router.resolve(location).href === route.fullPath) {
			// If we are already on the page, we shouldn't have to do anything. UNLESS we are on
			// scheduled posts page. Since it works based on a date that can change we need to
			// refresh the feed to properly sort everything again.
			if (tab === 'scheduled') {
				routeComponent.reloadRoute();
				return true;
			}
			return false;
		}

		router.push(location);
		return true;
	}

	private static getStateKey() {
		// vue-router maintains a history key for each route in the history.
		return typeof history !== 'undefined' ? history.state && history.state.key : undefined;
	}

	private static makeState(items: ActivityFeedInput[], options: ActivityFeedContainerOptions) {
		const key = this.getStateKey();
		const href = window.location.href;

		const state = {
			key,
			href,
			container: new ActivityFeedContainer(items, options),
		};

		// Keep it trimmed.
		this._states.unshift(state);
		this._states = this._states.slice(0, MaxCachedCount);

		return state;
	}

	private static findState() {
		const key = this.getStateKey();
		const href = window.location.href;

		// Note that we have to check the history state key AND the actual URL. If you replace a
		// route with vue, the history state key stays the same, even though the route changes.
		return this._states.find(item => item.key === key && item.href === href);
	}

	private static bootstrapFeedFromCache() {
		const state = this.findState();
		if (state) {
			// Reset bootstrapped items so that we can go "back" to this feed really fast.
			state.container.resetBootstrapped();
			return state.container;
		}

		return null;
	}

	private static bootstrapFeed(items: any[], options: ActivityFeedContainerOptions) {
		const populatedItems =
			options.type === 'EventItem' ? EventItem.populate(items) : Notification.populate(items);

		const state = this.makeState(populatedItems, options);
		return state.container;
	}
}
