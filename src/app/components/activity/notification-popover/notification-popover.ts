import View from '!view!./notification-popover.html?style=./notification-popover.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
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
}
