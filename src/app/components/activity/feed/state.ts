import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import Vue from 'vue';
import { ActivityFeedItem } from './item-service';

export interface ActivityFeedStateOptions {
	/**
	 * Which types of models are used in the feed.
	 */
	type: 'Notification' | 'EventItem';

	/**
	 * The URL to hit to load more from the feed.
	 */
	url: string;

	/**
	 * A timestamp of when the notifications in this feed were last viewed.
	 */
	notificationWatermark?: number;
}

export class ActivityFeedState {
	feedType: 'Notification' | 'EventItem';
	items: ActivityFeedItem[] = [];
	users: { [k: number]: User } = {};
	games: { [k: number]: Game } = {};
	notificationWatermark = 0; // Timestamp.
	viewedItems: string[] = [];
	expandedItems: string[] = [];
	isBootstrapped = false;
	isLoadingMore = false;
	isLoadingNew = false;
	reachedEnd = false;
	readonly loadMoreUrl: string;

	get startScrollId() {
		const firstPost = this.items[0];
		return firstPost ? firstPost.scrollId : undefined;
	}

	get endScrollId() {
		const lastFeedItem = this.items[this.items.length - 1];
		return lastFeedItem ? lastFeedItem.scrollId : undefined;
	}

	constructor(options: ActivityFeedStateOptions) {
		this.feedType = options.type;
		this.loadMoreUrl = options.url;

		if (typeof options.notificationWatermark !== 'undefined') {
			this.notificationWatermark = options.notificationWatermark;
		}
	}

	clear() {
		this.items = [];
		this.users = {};
		this.games = {};
		this.viewedItems = [];
		this.expandedItems = [];
		this.isBootstrapped = false;
		this.reachedEnd = false;
	}

	addItems(items: ActivityFeedItem[], position: 'start' | 'end' = 'start') {
		if (position === 'start') {
			this.items = items.concat(this.items);
		} else if (position === 'end') {
			this.items = this.items.concat(items);
		}

		this.isBootstrapped = true;
		this.processUsers(items);
		this.processGames(items);
	}

	removeItems(items: ActivityFeedItem[]) {
		for (const item of items) {
			arrayRemove(
				this.items,
				i => i.type === item.type && i.feedItem.id === item.feedItem.id
			);
		}
	}

	markItemViewed(item: ActivityFeedItem) {
		if (this.viewedItems.indexOf(item.id) !== -1) {
			return;
		}

		this.viewedItems.push(item.id);
		item.$viewed();
	}

	markItemExpanded(item: ActivityFeedItem) {
		if (this.expandedItems.indexOf(item.id) !== -1) {
			return;
		}

		this.expandedItems.push(item.id);
		item.$expanded();

		Analytics.trackEvent('activity-feed', 'expanded-item');
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
						Vue.set(this.users as any, user.id, user);
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
						Vue.set(this.games as any, game.id, game);
					}

					item.feedItem.game = this.games[game.id];
				}
			}
		}
	}
}
