import Vue from 'vue';
import { ActivityFeedItem, ActivityFeedInput } from './item-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { arrayRemove } from '../../../../lib/gj-lib-client/utils/array';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';

/**
 * The number of items from the bottom that we should hit before loading more.
 */
const LOAD_MORE_FROM_BOTTOM = 5;

/**
 * The number of times we should do an auto-load of items before stopping
 * and requiring them to do it manually.
 */
const LOAD_MORE_TIMES = 3;

export interface ActivityFeedContainerOptions {
	/**
	 * Which types of models are used in the feed.
	 */
	type: 'Fireside_Post' | 'Notification';

	/**
	 * The URL to hit to load more from the feed.
	 */
	url: string;

	/**
	 * Disables infinite scroll.
	 */
	noAutoload?: boolean;

	/**
	 * A timestamp of when the notifications in this feed were last viewed.
	 */
	notificationWatermark?: number;
}

export class ActivityFeedContainer {
	feedType: 'Notification' | 'Fireside_Post';
	items: ActivityFeedItem[] = [];
	games: { [k: string]: any } = {};

	notificationWatermark = 0; // Timestamp.
	reachedEnd = false;

	viewedItems: string[] = [];
	expandedItems: string[] = [];
	inViewItems: { [k: string]: ActivityFeedItem } = {};
	activeItem: ActivityFeedItem | null = null;
	scroll = 0;
	noAutoload = false;
	isLoadingMore = false;
	timesLoaded = 0;
	private loadMoreUrl: string;

	get hasItems() {
		return this.items.length > 0;
	}

	constructor(items: ActivityFeedInput[], options: ActivityFeedContainerOptions) {
		this.append(items);

		this.feedType = options.type;
		this.loadMoreUrl = options.url;
		this.noAutoload = options.noAutoload || false;

		if (typeof options.notificationWatermark !== 'undefined') {
			this.notificationWatermark = options.notificationWatermark;
		}
	}

	prepend(input: ActivityFeedInput[]) {
		const items = input.map(item => new ActivityFeedItem(item));
		this.items = items.concat(this.items);
		this.processGames();
	}

	append(input: ActivityFeedInput[]) {
		const items = input.map(item => new ActivityFeedItem(item));
		this.items = this.items.concat(items);
		this.processGames();
	}

	update(_input: ActivityFeedInput) {
		this.processGames();
	}

	remove(input: ActivityFeedInput) {
		const item = new ActivityFeedItem(input);
		arrayRemove(this.items, i => i.type === item.type && i.feedItem.id === item.feedItem.id);

		this.processGames();
	}

	viewed(item: ActivityFeedItem) {
		if (this.viewedItems.indexOf(item.id) !== -1) {
			return;
		}

		this.viewedItems.push(item.id);

		if (item.type === 'devlog-post') {
			const feedItem = item.feedItem as FiresidePost;
			feedItem.$viewed();
		}
	}

	expanded(item: ActivityFeedItem) {
		if (this.expandedItems.indexOf(item.id) !== -1) {
			return;
		}

		this.expandedItems.push(item.id);

		if (item.type === 'devlog-post') {
			const feedItem = item.feedItem as FiresidePost;
			feedItem.$expanded();
		}

		Analytics.trackEvent('activity-feed', 'expanded-item');
	}

	inViewChange(item: ActivityFeedItem, visible: boolean) {
		if (visible) {
			Vue.set(this.inViewItems, item.id, item);
			this.viewed(item);

			// Auto-loading while scrolling.
			if (
				!this.noAutoload &&
				!this.isLoadingMore &&
				!this.reachedEnd &&
				this.timesLoaded < LOAD_MORE_TIMES
			) {
				const index = this.items.findIndex(_item => _item.id === item.id);
				if (index >= this.items.length - LOAD_MORE_FROM_BOTTOM) {
					this.loadMore();
				}
			}
		} else {
			Vue.delete(this.inViewItems, item.id);
		}
	}

	async loadMore() {
		if (this.isLoadingMore || this.reachedEnd) {
			return;
		}

		this.isLoadingMore = true;
		++this.timesLoaded;

		const lastPost = this.items[this.items.length - 1];

		const response = await Api.sendRequest(this.loadMoreUrl, {
			scrollId: lastPost.scrollId,
		});

		this.isLoadingMore = false;

		if (!response.items || !response.items.length) {
			this.reachedEnd = true;
			Analytics.trackEvent('activity-feed', 'reached-end');
			return;
		}

		if (this.feedType === 'Notification') {
			this.append(Notification.populate(response.items));
		} else if (this.feedType === 'Fireside_Post') {
			this.append(FiresidePost.populate(response.items));
		}

		Analytics.trackEvent('activity-feed', 'loaded-more', 'page-' + this.timesLoaded);
	}

	/**
	 * This ensures that any reference to a particular game any of the feed items
	 * are shared across all items. It not only reduces mem usage, but also helps
	 * to keep things in sync (game follows, etc).
	 */
	private processGames() {
		for (const item of this.items) {
			if (item.feedItem instanceof FiresidePost) {
				if (!this.games[item.feedItem.game.id]) {
					Vue.set(this.games, item.feedItem.game.id, item.feedItem.game);
				} else {
					Vue.set(item.feedItem, 'game', this.games[item.feedItem.game.id]);
				}
			}
		}
	}
}
