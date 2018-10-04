import View from '!view!./notifications.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { Store } from '../../../store';

@View
@Component({
	name: 'RouteActivityNotifications',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteActivityNotifications extends BaseRouteComponent {
	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	feed: ActivityFeedContainer | null = null;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/activity/notifications');
	}

	get routeTitle() {
		return this.$gettext(`Your Notifications`);
	}

	routeInit() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any, fromCache: boolean) {
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

		// Don't set if from cache, otherwise it could reset to the cached count
		// when switching between tabs.
		if (!fromCache) {
			// We clear the notifications for the tab we are on, and load in
			// counts for the other tab.
			this.setNotificationCount({ type: 'notifications', count: 0 });
			this.setNotificationCount({
				type: 'activity',
				count: $payload.activityUnreadCount,
			});
		}
	}

	loadedNew() {
		this.setNotificationCount({ type: 'notifications', count: 0 });
	}
}
