import 'game-jolt-frontend-lib/components/comment/comment.styl';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { Mention } from 'game-jolt-frontend-lib/components/mention/mention.model';
import {
	getNotificationText,
	Notification,
} from 'game-jolt-frontend-lib/components/notification/notification-model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import AppTimelineListItem from 'game-jolt-frontend-lib/components/timeline-list/item/item.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedView } from '../view';

@Component({
	components: {
		AppTimelineListItem,
		AppTimeAgo,
		AppFadeCollapse,
		AppUserCardHover,
		AppUserAvatar,
		AppContentViewer,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppActivityFeedNotification extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	notification!: Notification;

	canToggleContent = false;
	showFullContent = false;

	readonly Screen = Screen;

	get isNew() {
		return this.feed.isItemUnread(this.item);
	}

	get titleText() {
		return getNotificationText(this.notification);
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
