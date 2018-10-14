import View from '!view!./notifications.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { Store, store } from '../../../store';

@View
@Component({
	name: 'RouteActivityNotifications',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	cache: true,
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
export default class RouteActivityNotifications extends BaseRouteComponent {
	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	feed: ActivityFeedContainer | null = null;

	get routeTitle() {
		return this.$gettext(`Your Notifications`);
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'Notification',
				url: `/web/dash/activity/more/notifications`,
				notificationWatermark: $payload.unreadWatermark,
			},
			$payload.items,
			fromCache
		);
	}

	loadedNew() {
		this.setNotificationCount({ type: 'notifications', count: 0 });
	}

	async onClickMarkAllAsRead() {
		await Api.sendRequest('/web/dash/activity/mark-all-read', {});
		// mark all loaded notifications as read temporarely
		if (this.feed) {
			for (const item of this.feed.items) {
				if (item.feedItem instanceof Notification) {
					const notification = item.feedItem as Notification;
					if (notification.viewed_on === null) {
						notification.viewed_on = Date.now();
					}
				}
			}
		}
	}
}
