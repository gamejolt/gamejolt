import { Injectable } from 'ng-metadata/core';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

export type ActivityFeedInput = Notification | Fireside_Post;

export function ActivityFeedItemFactory( Notification, Fireside_Post )
{
	ActivityFeedItem.Notification = Notification;
	ActivityFeedItem.Fireside_Post = Fireside_Post;
	return ActivityFeedItem;
}

@Injectable()
export class ActivityFeedItem
{
	static Notification: typeof Notification;
	static Fireside_Post: typeof Fireside_Post;

	id: string;
	type: 'devlog-post' | 'notification';
	feedItem: ActivityFeedInput;

	constructor( private _item: ActivityFeedInput )
	{
		if ( _item instanceof ActivityFeedItem.Notification && _item.type == ActivityFeedItem.Notification.TYPE_DEVLOG_POST_ADD ) {
			this.feedItem = _item.action_model;
		}
		else {
			this.feedItem = _item;
		}

		// For proper type guards below.
		const item = this.feedItem;
		let dateVal;

		if ( item instanceof ActivityFeedItem.Fireside_Post ) {
			this.type = 'devlog-post';
			dateVal = item.updated_on || item.added_on;
		}
		else if ( item instanceof ActivityFeedItem.Notification ) {
			this.type = 'notification';
			dateVal = item.added_on;
		}

		this.id = `${this.type}-${this.feedItem.id}-${dateVal}`;
	}
}
