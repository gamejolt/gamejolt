import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { EventItem } from '../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';

export type ActivityFeedInput = Notification | FiresidePost | EventItem;

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
		if (this.feedItem instanceof FiresidePost) {
			this.type = 'event-item';
			dateVal = this.feedItem.updated_on || this.feedItem.added_on;

			// We have to spoof this as an event item.
			const post = this.feedItem;
			this.feedItem = new EventItem({
				type: EventItem.TYPE_POST_ADD,
				added_on: dateVal,
				scroll_id: post.scroll_id,
				action_resource_model: post,
				from_resource_model: post.user,
				// Game posts will have a game, user posts just post to their user.
				to_resource_model: post.game || post.user,
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
