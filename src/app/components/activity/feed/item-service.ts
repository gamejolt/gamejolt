import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { EventItem } from '../../../../lib/gj-lib-client/components/event-item/event-item.model';

export type ActivityFeedInput = Notification | FiresidePost | EventItem;

export class ActivityFeedItem {
	id: string;
	type: 'devlog-post' | 'notification' | 'event-item';
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
				type: 'devlog-post-add',
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
}
