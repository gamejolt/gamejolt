import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./notification.html';

import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedItem } from '../item-service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppNotificationDescriptiveAction } from '../../../notification/descriptive-action/descriptive-action';
import { AppTimelineListItem } from '../../../../../lib/gj-lib-client/components/timeline-list/item/item';
import { Mention } from '../../../../../lib/gj-lib-client/components/mention/mention.model';

@View
@Component({
	components: {
		AppTimelineListItem,
		AppJolticon,
		AppTimeAgo,
		AppFadeCollapse,
		AppNotificationDescriptiveAction,
	},
})
export class AppActivityFeedNotification extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isActive?: boolean;

	notification: Notification;

	canToggleContent = false;
	showFullContent = false;

	Screen = makeObservableService(Screen);

	get icon() {
		return this.notification.jolticon.replace('jolticon-', '');
	}

	get hasDetails() {
		if (
			this.notification.type === Notification.TYPE_MENTION &&
			(this.notification.action_model as Mention).resource === 'Comment'
		) {
			return true;
		}

		return (
			[
				Notification.TYPE_COMMENT_ADD,
				Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
				Notification.TYPE_GAME_RATING_ADD,
			].indexOf(this.notification.type) !== -1
		);
	}

	created() {
		this.notification = this.item.feedItem as Notification;
	}

	go() {
		this.notification.go(this.$router);
		this.$emit('clicked');
	}

	toggleFull() {
		this.showFullContent = !this.showFullContent;
	}
}
