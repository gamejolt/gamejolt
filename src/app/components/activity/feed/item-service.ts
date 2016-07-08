import { Injectable } from 'ng-metadata/core';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

export type ActivityFeedModels = Notification | Fireside_Post;

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
	feedItem: ActivityFeedModels;

	constructor( private _item: ActivityFeedModels )
	{
		if ( _item instanceof ActivityFeedItem.Notification && _item.type == ActivityFeedItem.Notification.TYPE_DEVLOG_POST_ADD ) {
			this.feedItem = _item.action_model;
		}
		else {
			this.feedItem = _item;
		}

		// For proper type guards below.
		const item = this.feedItem;

		if ( this.feedItem instanceof ActivityFeedItem.Fireside_Post ) {
			this.type = 'devlog-post';
		}
		else if ( this.feedItem instanceof ActivityFeedItem.Notification ) {
			this.type = 'notification';
		}

		let dateVal;
		if ( item instanceof ActivityFeedItem.Notification ) {
			dateVal = item.added_on;
		}
		else if ( item instanceof ActivityFeedItem.Fireside_Post ) {
			dateVal = item.updated_on;
		}

		this.id = `${this.type}-${this.feedItem.id}-${dateVal}`;
		console.log( this.id );
	}
}
