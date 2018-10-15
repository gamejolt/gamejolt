import View from '!view!./notification-popover.html?style=./notification-popover.styl';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { store } from '../../../store';
import { AppActivityFeed } from '../feed/feed';
import { ActivityFeedContainer } from '../feed/feed-container-service';
import { ActivityFeedService } from '../feed/feed-service';

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeed,
	},
})
export class AppNotificationPopover extends Vue {
	isLoading = true;
	feed: ActivityFeedContainer | null = null;

	async mounted() {
		const $payload = await Api.sendRequest('/web/dash/activity/notifications');
		// clear notification count and update activity count
		store.commit('setNotificationCount', { type: 'notifications', count: 0 });
		store.commit('setNotificationCount', {
			type: 'activity',
			count: $payload.activityUnreadCount,
		});
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'Notification',
				url: `/web/dash/activity/more/notifications`,
				notificationWatermark: $payload.unreadWatermark,
				isInfinite: false,
			},
			$payload.items,
			false
		);
		this.isLoading = false;
	}

	async markAllAsRead() {
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
