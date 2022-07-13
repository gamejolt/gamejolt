import { inject, InjectionKey } from 'vue';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import { Notification } from '../../../../_common/notification/notification-model';
import { ScrollInviewConfig } from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { ActivityFeedInterface } from './AppActivityFeed.vue';
import { ActivityFeedInput, ActivityFeedItem } from './item-service';
import { ActivityFeedState } from './state';

const ScrollDirectionFrom = 'from';
const ScrollDirectionTo = 'to';

let globalIndex = 0;

class ActivityFeedViewItemState {
	isBootstrapped = true;
	isHydrated = false;
	isOpen = false;
	isLeadOpen = false;
	isShowingFollow = false;
	height: string | null = null;
}

export interface ActivityFeedViewOptions {
	slice?: number;
	shouldScroll?: boolean;
	mainCommunity?: Community | null;
	hideGameInfo?: boolean;
	shouldShowUserCards?: boolean;
	shouldShowFollow?: boolean;
	itemsPerPage?: number;
	shouldShowDates?: boolean;
}

export const ActivityFeedKey: InjectionKey<ActivityFeedView> = Symbol('activity-feed');

export function useActivityFeed() {
	return inject(ActivityFeedKey);
}

export const ActivityFeedInterfaceKey: InjectionKey<ActivityFeedInterface> =
	Symbol('activity-feed-interface');

/**
 * Can be used by the various feed components to track whether or not they're
 * the focused feed component.
 */
export const InviewConfigFocused = new ScrollInviewConfig({ trackFocused: true });

export class ActivityFeedView {
	/**
	 * We keep a feed ID so that when we clear we can change it and let vue
	 * know that the feed has completely modified
	 */
	id = ++globalIndex;
	readonly state: ActivityFeedState;
	itemStates: { [k: string]: ActivityFeedViewItemState } = {};
	slice: number | null = null;
	timesLoaded = 0;
	totalTimesLoaded = 0;
	shouldScroll = true;
	hideGameInfo = false;
	mainCommunity: Community | null = null;
	shouldShowUserCards = true;
	shouldShowFollow = false;
	shouldShowDates = true;
	newCount = 0;
	/**
	 * How many feed items are expected to be loaded per page.
	 */
	itemsPerPage!: number;

	get isBootstrapped() {
		return this.state.isBootstrapped;
	}

	get items() {
		if (this.slice) {
			return this.state.items.slice(0, this.slice);
		}
		return this.state.items;
	}

	get hasItems() {
		return this.items.length > 0;
	}

	get isLoadingMore() {
		return this.state.isLoadingMore;
	}

	get isLoadingNew() {
		return this.state.isLoadingNew;
	}

	get reachedEnd() {
		return this.state.reachedEnd;
	}

	/**
	 * The number of times we should do an auto-load of items before stopping and requiring them to do
	 * it manually.
	 */
	get autoLoadTimes() {
		// Load at least once; and try to auto-load approx. 50 items.
		return Math.max(1, Math.floor(50 / this.itemsPerPage));
	}

	get shouldScrollLoadMore() {
		// We don't allow loading more if they are viewing a slice of the items.
		return (
			!this.slice &&
			!this.isLoadingMore &&
			!this.reachedEnd &&
			this.timesLoaded < this.autoLoadTimes
		);
	}

	constructor(
		state: ActivityFeedState,
		{
			slice,
			shouldScroll = true,
			hideGameInfo = false,
			mainCommunity = null,
			shouldShowUserCards = true,
			shouldShowFollow = false,
			itemsPerPage = -1,
			shouldShowDates = true,
		}: ActivityFeedViewOptions = {}
	) {
		this.state = state;
		this.slice = slice || null;
		this.shouldScroll = shouldScroll;
		this.hideGameInfo = hideGameInfo;
		this.mainCommunity = mainCommunity;
		this.shouldShowUserCards = shouldShowUserCards;
		this.shouldShowFollow = shouldShowFollow;
		this.itemsPerPage = itemsPerPage;

		// Should never create a feed view without this argument.
		if (this.itemsPerPage === -1) {
			throw new Error(
				'Tried creating feed view without setting items per page! Load url: ' +
					this.state.loadMoreUrl
			);
		}
		this.shouldShowDates = shouldShowDates;
	}

	clear() {
		this.id = ++globalIndex;
		this.state.clear();
		this.itemStates = {};
		this.timesLoaded = 0;
		this.totalTimesLoaded = 0;
		this.newCount = 0;
	}

	prepend(input: ActivityFeedInput[]) {
		this.addItems(input, 'start');
	}

	append(input: ActivityFeedInput[]) {
		this.addItems(input, 'end');
	}

	update(input: ActivityFeedInput) {
		// We have to try to see if this item is being managed in the list of
		// items, and if so we need to refresh its games data.
		const searchItem = new ActivityFeedItem(input);
		const item = this.state.items.find(i => i.id === searchItem.id);
		if (item) {
			this.state.processGames([item]);
		}
	}

	remove(input: ActivityFeedInput[]) {
		const items = input.map(i => new ActivityFeedItem(i));
		this.state.removeItems(items);
	}

	isItemUnread(item: ActivityFeedItem) {
		// Notifications are considered unread if their viewed on isn't set yet.
		if (item.feedItem instanceof Notification && item.feedItem.viewed_on === null) {
			// If a notification watermark is passed in, we allow it to
			// override. This makes "mark all as read" easier to implement.
			if (
				this.state.notificationWatermark !== 0 &&
				item.feedItem.added_on < this.state.notificationWatermark
			) {
				return false;
			}

			return true;
		}

		// For other feed item types, we only use the watermark.
		if (this.state.notificationWatermark === 0) {
			return false;
		}

		return item.feedItem.added_on > this.state.notificationWatermark;
	}

	isItemBootstrapped(item: ActivityFeedItem) {
		return import.meta.env.SSR || this.getItemState(item).isBootstrapped;
	}

	isItemHydrated(item: ActivityFeedItem) {
		return import.meta.env.SSR || this.getItemState(item).isHydrated;
	}

	setItemHeight(item: ActivityFeedItem, height: string | null) {
		this.getItemState(item).height = height;
	}

	getItemHeight(item: ActivityFeedItem) {
		return this.getItemState(item).height;
	}

	setItemLeadOpen(item: ActivityFeedItem, open: boolean) {
		this.getItemState(item).isLeadOpen = open;
	}

	toggleItemLeadOpen(item: ActivityFeedItem) {
		const itemState = this.getItemState(item);
		itemState.isLeadOpen = !itemState.isLeadOpen;
	}

	isItemLeadOpen(item: ActivityFeedItem) {
		return this.getItemState(item).isLeadOpen;
	}

	setItemOpen(item: ActivityFeedItem, open: boolean) {
		this.getItemState(item).isOpen = open;
	}

	toggleItemOpen(item: ActivityFeedItem) {
		const itemState = this.getItemState(item);
		itemState.isOpen = !!itemState.isOpen;
	}

	isItemOpen(item: ActivityFeedItem) {
		return this.getItemState(item).isOpen;
	}

	setItemShowingFollow(item: ActivityFeedItem, showFollow: boolean) {
		this.getItemState(item).isShowingFollow = showFollow;
	}

	isItemShowingFollow(item: ActivityFeedItem) {
		return this.getItemState(item).isShowingFollow;
	}

	resetBootstrapped() {
		Object.values(this.itemStates).forEach(i => (i.isBootstrapped = false));
	}

	setItemViewed(item: ActivityFeedItem) {
		return this.state.markItemViewed(item);
	}

	setItemHydration(item: ActivityFeedItem, visible: boolean) {
		const itemState = this.getItemState(item);

		if (visible) {
			itemState.isBootstrapped = true;
			itemState.isHydrated = true;
		} else {
			itemState.isHydrated = false;
		}
	}

	async loadMore() {
		if (this.isLoadingMore || this.reachedEnd) {
			return;
		}

		this.state.isLoadingMore = true;
		++this.timesLoaded;
		++this.totalTimesLoaded;

		const response = await Api.sendRequest(this.state.loadMoreUrl, {
			scrollId: this.state.endScrollId,
			scrollDirection: ScrollDirectionFrom,
		});

		this.state.isLoadingMore = false;

		if (response.perPage) {
			this.itemsPerPage = response.perPage;
		}

		if (!response.items || !response.items.length) {
			this.state.reachedEnd = true;
			Analytics.trackEvent('activity-feed', 'reached-end');
			return;
		}

		if (this.state.feedType === 'Notification') {
			this.append(Notification.populate(response.items));
		} else if (this.state.feedType === 'EventItem') {
			this.append(EventItem.populate(response.items));
		}

		Analytics.trackEvent('activity-feed', 'loaded-more', 'page-' + this.totalTimesLoaded);
	}

	async loadNew(newCount = this.itemsPerPage) {
		if (this.state.isLoadingNew || newCount < 1) {
			return;
		}

		this.state.isLoadingNew = true;

		// If the new count is greater than the amount we show on a page, then
		// we want to refresh the whole thing so that we don't have gaps.
		const clearOld = newCount > this.itemsPerPage;

		const response = await Api.sendRequest(this.state.loadMoreUrl, {
			scrollId: this.state.startScrollId,
			scrollDirection: ScrollDirectionTo,
		});

		this.state.isLoadingNew = false;

		if (response.perPage) {
			this.itemsPerPage = response.perPage;
		}

		if (!response.items || !response.items.length) {
			return;
		}

		// If we received the amount of items per page (or more somehow),
		// clear the feed to avoid gaps.
		if (clearOld || response.items.length >= this.itemsPerPage) {
			this.clear();
		}

		if (this.state.feedType === 'Notification') {
			this.prepend(Notification.populate(response.items));
		} else if (this.state.feedType === 'EventItem') {
			this.prepend(EventItem.populate(response.items));
		}

		if (response.unreadWatermark) {
			this.state.notificationWatermark = response.unreadWatermark;
		}
	}

	private addItems(input: ActivityFeedInput[], position: 'start' | 'end' = 'start') {
		const items = input.map(i => new ActivityFeedItem(i));
		this.state.addItems(items, position);
	}

	private getItemState(item: ActivityFeedItem) {
		if (!this.itemStates[item.id]) {
			this.itemStates[item.id] = new ActivityFeedViewItemState();
		}

		return this.itemStates[item.id];
	}
}
