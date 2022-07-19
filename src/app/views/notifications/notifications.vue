<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Watch } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { HistoryCache } from '../../../_common/history/cache/cache.service';
import { Notification } from '../../../_common/notification/notification-model';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppShellNotificationPopoverStickerNavItem from '../../components/shell/notification-popover/sticker-nav-item/AppShellNotificationPopoverStickerNavItem.vue';
import AppShellNotificationPopoverStickerNavItemPlaceholder from '../../components/shell/notification-popover/sticker-nav-item/AppShellNotificationPopoverStickerNavItemPlaceholder.vue';
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
@OptionsForRoute({
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
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-centered">
					<template v-if="!feed || !feed.isBootstrapped">
						<AppShellNotificationPopoverStickerNavItemPlaceholder />
						<AppActivityFeedPlaceholder />
					</template>
					<template v-else>
						<template v-if="!feed.hasItems">
							<template v-if="shouldShowStickerPlaceholder">
								<AppShellNotificationPopoverStickerNavItemPlaceholder />
							</template>
							<AppShellNotificationPopoverStickerNavItem
								v-else-if="shouldShowStickers"
								:sticker-count="totalStickersCount"
								:has-new="hasNewUnlockedStickers"
							/>

							<div class="alert full-bleed-xs">
								<AppTranslate>You don't have any notifications yet.</AppTranslate>
							</div>
						</template>
						<template v-else>
							<p class="text-right">
								<a
									class="link-muted small"
									@click="store.markNotificationsAsRead()"
								>
									<AppTranslate>Mark All as Read</AppTranslate>
								</a>
							</p>

							<template v-if="shouldShowStickerPlaceholder">
								<AppShellNotificationPopoverStickerNavItemPlaceholder />
							</template>
							<AppShellNotificationPopoverStickerNavItem
								v-else-if="shouldShowStickers"
								:sticker-count="totalStickersCount"
								:has-new="hasNewUnlockedStickers"
							/>

							<AppActivityFeed :feed="feed" @load-new="onLoadedNew" />
						</template>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
