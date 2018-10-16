import View from '!view!./notification-popover.html?style=./notification-popover.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { Store } from '../../../store';
import { AppActivityFeed } from '../feed/feed';
import { ActivityFeedContainer } from '../feed/feed-container-service';
import { ActivityFeedService } from '../feed/feed-service';

@View
@Component({
	components: {
		AppPopper,
		AppLoading,
		AppActivityFeed,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppNotificationPopover extends Vue {
	@State
	notificationCount!: Store['notificationCount'];

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	isShowing = false;
	isLoading = true;
	feed: ActivityFeedContainer | null = null;

	readonly Connection = Connection;

	async mounted() {
		const $payload = await Api.sendRequest('/web/dash/activity/notifications');

		// Clear notification count and update activity count.
		this.setNotificationCount({ type: 'notifications', count: 0 });
		this.setNotificationCount({
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

		// Mark all loaded notifications as read temporarily.
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
