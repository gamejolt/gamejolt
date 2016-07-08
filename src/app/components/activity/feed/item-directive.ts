import { Component, Inject, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedModels } from './feed-service';
import template from './item.html';

@Component({
	selector: 'gj-activity-feed-item',
	template,
})
export class ItemComponent
{
	@Input( '<item' ) inputItem: ActivityFeedModels;

	item: ActivityFeedModels;
	itemType: string;

	constructor(
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post
	)
	{
		// For proper type guards below.
		const inputItem = this.inputItem;
		let item: ActivityFeedModels;

		if ( inputItem instanceof notificationModel && inputItem.type == notificationModel.TYPE_DEVLOG_POST_ADD ) {
			item = inputItem.action_model;
		}
		else {
			item = inputItem;
		}

		if ( item instanceof firesidePostModel ) {
			if ( item.type == firesidePostModel.TYPE_TEXT ) {
				this.itemType = 'text';
			}
			else if ( item.type == firesidePostModel.TYPE_MEDIA ) {
				this.itemType = 'media';
			}
		}
		else if ( item instanceof notificationModel ) {
			this.itemType = 'notification';
		}

		this.item = item;
	}
}
