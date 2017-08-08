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
			this.type = 'devlog-post';
			dateVal = this.feedItem.updated_on || this.feedItem.added_on;
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
