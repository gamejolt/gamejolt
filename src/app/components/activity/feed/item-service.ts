import { EventItem, EventItemType } from '../../../../_common/event-item/event-item.model';
import { $viewPost, FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Notification } from '../../../../_common/notification/notification-model';

export type ActivityFeedInput = Notification | EventItem;

export class ActivityFeedItem {
	constructor(public feedItem: ActivityFeedInput) {}

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

	isEqual(other: ActivityFeedItem) {
		return this.type === other.type && this.feedItem.id === other.feedItem.id;
	}

	$viewed(sourceFeed: string) {
		if (this.feedItem instanceof EventItem && this.feedItem.type === EventItemType.PostAdd) {
			$viewPost(this.feedItem.action as FiresidePost, sourceFeed);
		}
	}
}
