import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Notification } from '../../../../_common/notification/notification-model';

export type ActivityFeedInput = Notification | EventItem;

export class ActivityFeedItem {
	feedItem: ActivityFeedInput;

	get id() {
		return this.feedItem.id + '';
	}

	get type() {
		if (this.feedItem instanceof Notification) {
			return 'notification';
		}

		return 'event-item';
	}

	get scrollId() {
		return this.feedItem.scroll_id as string;
	}

	constructor(sourceItem: ActivityFeedInput) {
		this.feedItem = sourceItem;
	}

	isEqual(other: ActivityFeedItem) {
		return this.type === other.type && this.feedItem.id === other.feedItem.id;
	}

	$viewed() {
		if (this.feedItem instanceof EventItem && this.feedItem.type === EventItem.TYPE_POST_ADD) {
			(this.feedItem.action as FiresidePost).$viewed();
		}
	}

	$expanded() {
		if (this.feedItem instanceof EventItem) {
			if (this.feedItem.type === EventItem.TYPE_POST_ADD) {
				(this.feedItem.action as FiresidePost).$expanded();
			} else if (this.feedItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
				(this.feedItem.action as CommentVideo).$viewed();
			}
		}
	}
}
