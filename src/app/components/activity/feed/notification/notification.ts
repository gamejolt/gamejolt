import View from '!view!./notification.html?style=./notification.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import { AppUserAvatar } from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import '../../../../../lib/gj-lib-client/components/comment/comment.styl';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Mention } from '../../../../../lib/gj-lib-client/components/mention/mention.model';
import {
	getNotificationText,
	Notification,
} from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTimelineListItem } from '../../../../../lib/gj-lib-client/components/timeline-list/item/item';
import { ActivityFeedItem } from '../item-service';

@View
@Component({
	components: {
		AppTimelineListItem,
		AppTimeAgo,
		AppFadeCollapse,
		AppUserCardHover,
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export class AppActivityFeedNotification extends Vue {
	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(Boolean)
	isNew?: boolean;

	@Prop(Boolean)
	isActive?: boolean;

	notification!: Notification;

	canToggleContent = false;
	showFullContent = false;

	readonly Screen = Screen;

	get isNewNotification() {
		return this.notification.viewed_on === null || this.isNew;
	}

	get titleText() {
		return getNotificationText(this.notification);
	}

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
			[Notification.TYPE_COMMENT_ADD, Notification.TYPE_COMMENT_ADD_OBJECT_OWNER].indexOf(
				this.notification.type
			) !== -1
		);
	}

	created() {
		this.notification = this.item.feedItem as Notification;
	}

	go() {
		this.notification.$read();
		this.notification.go(this.$router);
		this.$emit('clicked');
	}

	toggleFull() {
		this.showFullContent = !this.showFullContent;
	}

	onMarkRead() {
		this.notification.$read();
	}

	onMarkUnread() {
		this.notification.$unread();
	}
}
