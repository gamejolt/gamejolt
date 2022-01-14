import { setup } from 'vue-class-component';
import { Options, Watch } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { HistoryCache } from '../../../_common/history/cache/cache.service';
import { Notification } from '../../../_common/notification/notification-model';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppShellNotificationPopoverStickerNavItemPlaceholder from '../../components/shell/notification-popover/sticker-nav-item/placeholder/placeholder.vue';
import AppShellNotificationPopoverStickerNavItem from '../../components/shell/notification-popover/sticker-nav-item/sticker-nav-item.vue';
import { Store, useAppStore } from '../../store';

const HistoryCacheFeedTag = 'notifications-feed';

@Options({
	name: 'RouteNotifications',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppShellNotificationPopoverStickerNavItem,
		AppShellNotificationPopoverStickerNavItemPlaceholder,
	},
})
@RouteResolver({
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/notifications')),
})
export default class RouteNotifications extends BaseRouteComponent {
	store = setup(() => useAppStore());

	get notificationState() {
		return this.store.notificationState;
	}

	get unreadNotificationsCount() {
		return this.store.unreadNotificationsCount;
	}

	get grid() {
		return this.store.grid;
	}

	get hasNewUnlockedStickers() {
		return this.store.hasNewUnlockedStickers;
	}

	feed: ActivityFeedView | null = null;
	itemsPerPage = 15;
	totalStickersCount = 0;
	isStickersLoading = true;

	get routeTitle() {
		return this.$gettext(`Your Notifications`);
	}

	get shouldShowStickers() {
		return this.totalStickersCount > 0;
	}

	get shouldShowStickerPlaceholder() {
		return this.isStickersLoading;
	}

	/**
	 * The route lazily resolves, so the store gets bootstrapped with user data
	 * a bit delayed. We want to bootstrap it in as soon as possible (before
	 * route resolve) which is why we do it in the watcher and not in route
	 * resolve. This is so we can show the "loading" feed.
	 */
	@Watch('notificationState', { immediate: true })
	onNotificationStateChange(state: Store['notificationState']) {
		if (state) {
			this.feed = new ActivityFeedView(state, { itemsPerPage: this.itemsPerPage });
		} else {
			this.feed = null;
		}
	}

	@Watch('unreadNotificationsCount', { immediate: true })
	onUnreadNotificationsCountChange() {
		if (this.feed && this.unreadNotificationsCount > this.feed.newCount) {
			this.feed.newCount = this.unreadNotificationsCount;
		}
	}

	async routeResolved($payload: any, fromCache: boolean) {
		// We mark in the history cache whether this route is a historical view
		// or a new view. If it's new, we want to load fresh. If it's old, we
		// want to use current feed data, just so we can try to go back to the
		// correct scroll spot.
		if (this.feed && !HistoryCache.has(this.$route, HistoryCacheFeedTag)) {
			this.feed.clear();
			this.feed.append(Notification.populate($payload.items));
			HistoryCache.store(this.$route, true, HistoryCacheFeedTag);
		}

		if ($payload.perPage) {
			if (this.feed) {
				this.feed.itemsPerPage = $payload.perPage;
			}

			this.itemsPerPage = $payload.perPage;
		}

		if (!fromCache) {
			this.grid?.pushViewNotifications('notifications');
		}

		const countPayload = await Api.sendRequest(`/web/stickers/user-count`);
		this.totalStickersCount = countPayload.count;
		this.isStickersLoading = false;
	}

	onLoadedNew() {
		if (this.unreadNotificationsCount > 0) {
			this.grid?.pushViewNotifications('notifications');
		}
	}
}
