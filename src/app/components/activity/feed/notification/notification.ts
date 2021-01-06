import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import '../../../../../_common/comment/comment.styl';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import {
	CommunityUserNotification,
	NotificationType,
} from '../../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { Mention } from '../../../../../_common/mention/mention.model';
import { Notification } from '../../../../../_common/notification/notification-model';
import { NotificationText } from '../../../../../_common/notification/notification-text.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { BaseTrophy } from '../../../../../_common/trophy/base-trophy.model';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import { getTrophyImg } from '../../../trophy/thumbnail/thumbnail';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../view';

@Component({
	components: {
		AppTimelineListItem,
		AppTimeAgo,
		AppFadeCollapse,
		AppUserCardHover,
		AppUserAvatar,
		AppContentViewer,
		AppCommunityThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppActivityFeedNotification extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	notification!: Notification;
	canToggleContent = false;
	readonly Screen = Screen;
	readonly Notification = Notification;

	get isNew() {
		return this.feed.isItemUnread(this.item);
	}

	get titleText() {
		return NotificationText.getText(this.notification, false);
	}

	get shouldShow() {
		// Only show when there is a title text for the notification.
		return this.titleText !== undefined;
	}

	get hasDetails() {
		if (
			this.notification.type === Notification.TYPE_MENTION &&
			(this.notification.action_model as Mention).resource === 'Comment'
		) {
			return true;
		}

		// Community user notifications with a post want to show the post lead.
		if (
			this.notification.type === Notification.TYPE_COMMUNITY_USER_NOTIFICATION &&
			[NotificationType.POSTS_EJECT, NotificationType.POSTS_MOVE].includes(
				(this.notification.action_model as CommunityUserNotification).type
			)
		) {
			return true;
		}

		return [
			Notification.TYPE_COMMENT_ADD,
			Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
			Notification.TYPE_POST_FEATURED_IN_COMMUNITY,
			Notification.TYPE_GAME_TROPHY_ACHIEVED,
			Notification.TYPE_SITE_TROPHY_ACHIEVED,
		].includes(this.notification.type);
	}

	get trophyImg() {
		if (
			this.notification.action_model instanceof UserBaseTrophy &&
			this.notification.action_model.trophy instanceof BaseTrophy
		) {
			return getTrophyImg(this.notification.action_model.trophy);
		}
	}

	created() {
		this.notification = this.item.feedItem as Notification;
	}

	go() {
		this.notification.$read();
		this.notification.go(this.$router);
		this.$emit('clicked');
	}

	onMarkRead() {
		this.notification.$read();
	}
}
