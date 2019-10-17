import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import '../../../../../_common/comment/comment.styl';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { Mention } from '../../../../../_common/mention/mention.model';
import {
	getNotificationText,
	Notification,
} from '../../../../../_common/notification/notification-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
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
		AppCommunityThumbnailImg,
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

	readonly Screen = Screen;
	readonly Notification = Notification;

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
			[
				Notification.TYPE_COMMENT_ADD,
				Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
				Notification.TYPE_POST_FEATURED_IN_COMMUNITY,
			].indexOf(this.notification.type) !== -1
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

	onMarkRead() {
		this.notification.$read();
	}

	onMarkUnread() {
		this.notification.$unread();
	}
}
