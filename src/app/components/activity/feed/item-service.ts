import { Injectable } from 'ng-metadata/core';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

export type ActivityFeedInput = Notification | Fireside_Post;

export function ActivityFeedItemFactory( Notification: any, Fireside_Post: any )
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

	constructor( private item: ActivityFeedInput )
	{
		if ( item instanceof ActivityFeedItem.Notification && item.type == ActivityFeedItem.Notification.TYPE_DEVLOG_POST_ADD ) {
			this.feedItem = item.action_model;
		}
		else {
			this.feedItem = item;
		}

		let dateVal: number;
		if ( this.feedItem instanceof ActivityFeedItem.Fireside_Post ) {
			this.type = 'devlog-post';
			dateVal = this.feedItem.updated_on || this.feedItem.added_on;
		}
		else if ( this.feedItem instanceof ActivityFeedItem.Notification ) {
			this.type = 'notification';
			dateVal = this.feedItem.added_on;
		}

		this.id = `${this.type}-${this.feedItem.id}-${dateVal}`;
	}
}
