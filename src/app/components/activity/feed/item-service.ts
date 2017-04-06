import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';

export type ActivityFeedInput = Notification | FiresidePost;

export class ActivityFeedItem
{
	id: string;
	type: 'devlog-post' | 'notification';
	feedItem: ActivityFeedInput;
	scrollId: string;
	height: string | null = null;

	constructor( public sourceItem: ActivityFeedInput )
	{
		if ( sourceItem instanceof Notification && sourceItem.type === Notification.TYPE_DEVLOG_POST_ADD ) {
			this.feedItem = sourceItem.action_model;
		}
		else {
			this.feedItem = sourceItem;
		}

		let dateVal = 0;
		if ( this.feedItem instanceof FiresidePost ) {
			this.type = 'devlog-post';
			dateVal = this.feedItem.updated_on || this.feedItem.added_on;
		}
		else if ( this.feedItem instanceof Notification ) {
			this.type = 'notification';
			dateVal = this.feedItem.added_on;
		}

		this.id = `${this.type}-${this.feedItem.id}-${dateVal}`;
		this.scrollId = sourceItem.scroll_id as string;
	}
}
