import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { EventItem } from '../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';

export type ActivityFeedInput = Notification | FiresidePost | EventItem;

export class ActivityFeedItem {
	id: string;
	type!: 'notification' | 'event-item';
	feedItem: ActivityFeedInput;
	scrollId: string;
	height: string | null = null;
	isOpen = false;
	isLeadOpen = false;

	constructor(public sourceItem: ActivityFeedInput) {
		this.feedItem = sourceItem;

		let dateVal = 0;
		if (this.feedItem instanceof FiresidePost) {
			this.type = 'event-item';
			dateVal = this.feedItem.published_on || this.feedItem.added_on;

			// We have to spoof this as an event item.
			const post = this.feedItem;
			this.feedItem = new EventItem({
				// TODO(new-post-format) - we set the mock event item id to the post id
				// to fix a bug where removing any item from the feed would always remove the first
				// because their ids were the same.
				//
				// This is a temporary hack that is already fixed in the user-posts branch.
				id: post.id,

				type: EventItem.TYPE_DEVLOG_POST_ADD,
				added_on: dateVal,
				scroll_id: post.scroll_id,
				action_resource_model: post,
				from_resource_model: post.user,
				to_resource_model: post.game,
			});
		} else if (this.feedItem instanceof Notification) {
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
		if (
			this.feedItem instanceof EventItem &&
			this.feedItem.type === EventItem.TYPE_DEVLOG_POST_ADD
		) {
			(this.feedItem.action as FiresidePost).$viewed();
		}
	}

	$expanded() {
		if (this.feedItem instanceof EventItem) {
			if (this.feedItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
				(this.feedItem.action as FiresidePost).$expanded();
			} else if (this.feedItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
				(this.feedItem.action as CommentVideo).$viewed();
			}
		}
	}
}
