import { Component, Watch } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { EventBus, EventBusDeregister } from '../../../system/event/event-bus.service';
import { Api } from '../../../_common/api/api.service';
import { HistoryCache } from '../../../_common/history/cache/cache.service';
import { Notification } from '../../../_common/notification/notification-model';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeed from '../../components/activity/feed/feed.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { ClearNotificationsEventData } from '../../components/grid/client.service';
import { Store, store } from '../../store';

const HistoryCacheFeedTag = 'notifications-feed';

@Component({
	name: 'RouteNotifications',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/notifications')),
	resolveStore({ payload, fromCache }) {
		// Don't set if from cache, otherwise it could reset to the cached count
		// when switching between tabs.
		if (!fromCache) {
			// We clear the notifications for the tab we are on, and load in
			// counts for the other tab.
			store.commit('setNotificationCount', { type: 'notifications', count: 0 });
			store.commit('setNotificationCount', {
				type: 'activity',
				count: payload.activityUnreadCount,
			});
		}
	},
})
export default class RouteNotifications extends BaseRouteComponent {
	@State
	notificationState!: Store['notificationState'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	@Action
	markNotificationsAsRead!: Store['markNotificationsAsRead'];

	@State
	grid!: Store['grid'];

	feed: ActivityFeedView | null = null;
	clearNotificationsDeregister?: EventBusDeregister;

	get routeTitle() {
		return this.$gettext(`Your Notifications`);
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
			this.feed = new ActivityFeedView(state);
		} else {
			this.feed = null;
		}
	}

	routeResolved($payload: any) {
		// We mark in the history cache whether this route is a historical view
		// or a new view. If it's new, we want to load fresh. If it's old, we
		// want to use current feed data, just so we can try to go back to the
		// correct scroll spot.
		if (this.feed && !HistoryCache.has(this.$route, HistoryCacheFeedTag)) {
			this.feed.clear();
			this.feed.append(Notification.populate($payload.items));
			HistoryCache.store(this.$route, true, HistoryCacheFeedTag);
		}

		this.grid?.pushViewNotifications('notifications');

		this.clearNotificationsDeregister = EventBus.on(
			'grid-clear-notifications',
			(data: ClearNotificationsEventData) => {
				if (data.type === 'notifications') {
					this.feed?.loadNew(data.currentCount);
				}
			}
		);
	}

	routeDestroyed() {
		if (this.clearNotificationsDeregister) {
			this.clearNotificationsDeregister();
			this.clearNotificationsDeregister = undefined;
		}
	}

	loadedNew() {
		this.setNotificationCount({ type: 'notifications', count: 0 });
		this.grid?.pushViewNotifications('notifications');
	}
}
