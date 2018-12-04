import View from '!view!./notifications.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { HistoryCache } from 'game-jolt-frontend-lib/components/history/cache/cache.service';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component, Watch } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { Store, store } from '../../store';

const HistoryCacheFeedTag = 'notifications-feed';

@View
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

	feed: ActivityFeedView | null = null;

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
	}

	loadedNew() {
		this.setNotificationCount({ type: 'notifications', count: 0 });
	}
}
