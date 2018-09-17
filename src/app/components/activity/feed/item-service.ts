import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { EventItem } from '../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';

export type ActivityFeedInput = Notification | EventItem;

export class ActivityFeedItem {
	id: string;
	type!: 'notification' | 'event-item';
	feedItem: ActivityFeedInput;
	scrollId: string;
	height: string | null = null;
	isOpen = false;

	constructor(public sourceItem: ActivityFeedInput) {
		this.feedItem = sourceItem;

		let dateVal = 0;
		if (this.feedItem instanceof Notification) {
			this.type = 'notification';
			dateVal = this.feedItem.added_on;
		} else if (this.feedItem instanceof EventItem) {
			this.type = 'event-item';
			dateVal = this.feedItem.added_on;
		}

		this.id = `${this.type}-${this.feedItem.id}-${dateVal}`;
		this.scrollId = sourceItem.scroll_id as string;
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
