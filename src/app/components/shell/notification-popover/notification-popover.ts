import View from '!view!./notification-popover.html?style=./notification-popover.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Notification } from 'game-jolt-frontend-lib/components/notification/notification-model';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppLoading } from 'game-jolt-frontend-lib/vue/components/loading/loading';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Store } from '../../../store';
import { AppActivityFeed } from '../../activity/feed/feed';
import { ActivityFeedView } from '../../activity/feed/view';

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
export class AppShellNotificationPopover extends Vue {
	@State
	notificationState!: Store['notificationState'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	isShowing = false;
	isLoading = true;
	feed: ActivityFeedView | null = null;

	readonly Connection = Connection;

	@Watch('notificationState', { immediate: true })
	onNotificationStateChange(state: Store['notificationState']) {
		if (state) {
			this.feed = new ActivityFeedView(state, { slice: 15, shouldScroll: false });
		} else {
			this.feed = null;
		}
	}

	async onShow() {
		this.isShowing = true;

		if (this.feed) {
			// If the feed isn't bootstrapped with data, then we have to do the
			// first bootstrapping call to get data into it.
			if (!this.feed.isBootstrapped) {
				const $payload = await Api.sendRequest('/web/dash/activity/notifications');

				const items = Notification.populate($payload.items);
				this.feed.append(items);
				this.setNotificationCount({ type: 'notifications', count: 0 });
			}
			// If it is already bootstrapped, we just want to load new items if
			// there is any.
			else {
				await this.feed.loadNew(this.unreadNotificationsCount);
				this.setNotificationCount({ type: 'notifications', count: 0 });
			}
		}

		this.isLoading = false;
	}

	onHide() {
		this.isShowing = false;
	}

	async markAllAsRead() {
		if (!this.feed) {
			return;
		}

		await Api.sendRequest('/web/dash/activity/mark-all-read', {});

		// Mark all loaded notifications as read through the feed watermark.
		// It's better than having to reload from the backend.
		this.feed.state.notificationWatermark = Date.now();
	}
}
