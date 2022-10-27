import { arrayRemove } from '../../../../utils/array';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { User } from '../../../../_common/user/user.model';
import { ActivityFeedItem } from './item-service';

export interface ActivityFeedStateOptions {
	/**
	 * Which types of models are used in the feed.
	 */
	type: 'Notification' | 'EventItem';

	/**
	 * A name to identify the feed. Used in tick tracking.
	 */
	name: string;

	/**
	 * The URL to hit to load more from the feed.
	 */
	url: string;

	/**
	 * A timestamp of when the notifications in this feed were last viewed.
	 */
	notificationWatermark?: number;

	/**
	 * Skips sending item-viewed ticks when items in this feed are viewed.
	 */
	suppressTicks?: boolean;
}

export class ActivityFeedState {
	constructor(options: ActivityFeedStateOptions) {
		this.feedType = options.type;
		this.feedName = options.name;
		this.loadMoreUrl = options.url;
		this.suppressTicks = options.suppressTicks ?? false;

		if (typeof options.notificationWatermark !== 'undefined') {
			this.notificationWatermark = options.notificationWatermark;
		}
	}

	feedType: 'Notification' | 'EventItem';
	feedName: string;
	readonly loadMoreUrl: string;
	suppressTicks: boolean;

	items: ActivityFeedItem[] = [];
	users: { [k: number]: User } = {};
	games: { [k: number]: Game } = {};
	notificationWatermark = 0; // Timestamp.
	viewedItems: string[] = [];

	isBootstrapped = false;
	isLoadingMore = false;
	isLoadingNew = false;
	reachedEnd = false;

	get startScrollId() {
		const firstPost = this.items[0];
		return firstPost ? firstPost.scrollId : undefined;
	}

	get endScrollId() {
		const lastFeedItem = this.items[this.items.length - 1];
		return lastFeedItem ? lastFeedItem.scrollId : undefined;
	}

	clear() {
		this.items = [];
		this.users = {};
		this.games = {};
		this.viewedItems = [];
		this.isBootstrapped = false;
		this.reachedEnd = false;
	}

	addItems(items: ActivityFeedItem[], position: 'start' | 'end' = 'start') {
		// Remove duplicates before adding.
		// This may happen if items in the feed change around while loading more.
		this.removeItems(items);

		if (position === 'start') {
			// When adding to the start, make sure to not bury the pinned post below the new ones.
			// We assume that new posts will not be pinned.
			let pinnedItem: ActivityFeedItem | undefined;
			if (this.items.length > 0) {
				const firstItem = this.items[0].feedItem;
				if (
					firstItem instanceof EventItem &&
					firstItem.action instanceof FiresidePost &&
					firstItem.action.is_pinned
				) {
					pinnedItem = this.items.shift();
				}
			}
			this.items = items.concat(this.items);
			if (pinnedItem) {
				this.items.unshift(pinnedItem);
			}
		} else if (position === 'end') {
			this.items = this.items.concat(items);
		}

		this.isBootstrapped = true;
		this.processUsers(items);
		this.processGames(items);
	}

	removeItems(items: ActivityFeedItem[]) {
		for (const item of items) {
			arrayRemove(this.items, i => i.isEqual(item));
		}
	}

	markItemViewed(item: ActivityFeedItem) {
		if (this.viewedItems.indexOf(item.id) !== -1) {
			return;
		}

		this.viewedItems.push(item.id);
		if (!this.suppressTicks) {
			item.$viewed(this.feedName);
		}
	}

	/**
	 * Same as processGames, this ensures that any reference to a particular user
	 * in any of the feed items are shared across all items.
	 * We need this to sync the user follows.
	 */
	processUsers(items: ActivityFeedItem[]) {
		for (const item of items) {
			if (item.feedItem instanceof EventItem) {
				const user = item.feedItem.user;
				if (user) {
					if (!this.users[user.id]) {
						this.users[user.id] = user;
					}

					item.feedItem.user = this.users[user.id];
				}
			}
		}
	}

	/**
	 * This ensures that any reference to a particular game any of the feed
	 * items are shared across all items. It not only reduces mem usage, but
	 * also helps to keep things in sync (game follows, etc).
	 */
	processGames(items: ActivityFeedItem[]) {
		for (const item of items) {
			if (item.feedItem instanceof EventItem) {
				const game = item.feedItem.game;
				if (game) {
					if (!this.games[game.id]) {
						this.games[game.id] = game;
					}

					item.feedItem.game = this.games[game.id];
				}
			}
		}
	}
}
