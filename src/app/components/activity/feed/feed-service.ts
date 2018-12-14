import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { Dictionary, Route } from 'vue-router/types/router';
import { ActivityFeedInput } from './item-service';
import { ActivityFeedState, ActivityFeedStateOptions } from './state';
import { ActivityFeedView, ActivityFeedViewOptions } from './view';

/**
 * Number of states we will keep cached. We will purge others out of the cache.
 */
const MaxCachedCount = 3;

interface ActivityFeedCachedState {
	key?: string;
	href?: string;
	view: ActivityFeedView;
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

type BootstrapOptions = ActivityFeedViewOptions & ActivityFeedStateOptions;

export class ActivityFeedService {
	private static cache: ActivityFeedCachedState[] = [];

	static makeFeedUrl(route: Route, url: string) {
		if (url.indexOf('?') === -1) {
			url += '?ignore';
		}

		// Attach the scroll ID if it exists in the URL. This is for SSR
		// pagination.
		if (route.query.feed_last_id) {
			url += '&scrollId=' + route.query.feed_last_id;
		}

		return url;
	}

	static routeInit(routeComponent: BaseRouteComponent) {
		// Try to pull the feed from cache if they are going back to this route.
		// We don't want to pull from cache if they go back and forth between
		// feed tabs, though.
		if (!routeComponent.isRouteBootstrapped) {
			return this.bootstrapFeedFromCache();
		}
		return null;
	}

	static routed(
		feed: ActivityFeedView | null,
		options: BootstrapOptions,
		items: any[],
		fromPayloadCache: boolean
	) {
		// If there is a feed pulled from cache in routeInit, we just use that.
		if (feed) {
			return feed;
		}

		// Never pull from cache.
		if (fromPayloadCache) {
			return null;
		}

		// If we couldn't fetch a cached feed when routeInit was called, we
		// should start fresh.
		return ActivityFeedService.bootstrapFeed(items, options);
	}

	static onPostAdded(
		feed: ActivityFeedView,
		post: FiresidePost,
		routeComponent: BaseRouteComponent
	) {
		if (!post.event_item) {
			throw new Error('Post was expected to have an event_item field after being added');
		}

		// If we are already on the feed page that we need to be, let's just
		// insert the post into the feed.
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
	 * Returns true if it went to a new page, or false if we were already on the
	 * page required.
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
			// If we are already on the page, we shouldn't have to do anything.
			// UNLESS we are on scheduled posts page. Since it works based on a
			// date that can change we need to refresh the feed to properly sort
			// everything again.
			if (tab === 'scheduled') {
				routeComponent.reloadRoute();
				return true;
			}
			return false;
		}

		router.push(location);
		return true;
	}

	private static getCachedStateKey() {
		// vue-router maintains a history key for each route in the history.
		return typeof history !== 'undefined' ? history.state && history.state.key : undefined;
	}

	private static makeCachedState(items: ActivityFeedInput[], options: BootstrapOptions) {
		const key = this.getCachedStateKey();
		const href = typeof window !== 'undefined' ? window.location.href : undefined;

		const state = new ActivityFeedState(options);
		const view = new ActivityFeedView(state, options);
		view.append(items);

		const cachedState: ActivityFeedCachedState = {
			key,
			href,
			view,
		};

		// Keep it trimmed.
		this.cache.unshift(cachedState);
		this.cache = this.cache.slice(0, MaxCachedCount);

		return cachedState;
	}

	private static findCachedState() {
		const key = this.getCachedStateKey();
		const href = typeof window !== 'undefined' ? window.location.href : undefined;

		// Note that we have to check the history state key AND the actual URL.
		// If you replace a route with vue, the history state key stays the
		// same, even though the route changes.
		return this.cache.find(item => item.key === key && item.href === href);
	}

	private static bootstrapFeedFromCache() {
		const state = this.findCachedState();
		if (state) {
			// Reset bootstrapped items so that we can go "back" to this feed
			// really fast.
			state.view.resetBootstrapped();

			// We have to put the state back on top so that it was just
			// accessed. We don't want it being cleaned up.
			arrayRemove(this.cache, i => i === state);
			this.cache.unshift(state);

			return state.view;
		}

		return null;
	}

	private static bootstrapFeed(items: any[], options: BootstrapOptions) {
		const populatedItems =
			options.type === 'EventItem' ? EventItem.populate(items) : Notification.populate(items);

		const state = this.makeCachedState(populatedItems, options);
		return state.view;
	}
}
