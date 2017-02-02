import { Component, Inject, Input, Output, EventEmitter } from 'ng-metadata/core';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedItem } from '../item-service';
import * as template from '!html-loader!./notification.html';

@Component({
	selector: 'gj-activity-feed-notification',
	template,
})
export class ActivityFeedNotificationComponent
{
	@Input( '<' ) item: ActivityFeedItem;

	@Output() private onClick = new EventEmitter<void>();

	notification: Notification;

	// We bind-once canToggleContent. It needs to be undefined so that it
	// doesn't bind until we know if the content can be toggled.
	canToggleContent: boolean | undefined = undefined;
	showFullContent = false;

	constructor(
		@Inject( 'Notification' ) public notificationModel: typeof Notification,
		@Inject( 'Screen' ) public screen: Screen
	)
	{
		this.notification = this.item.feedItem as Notification;
	}

	go( $event: ng.IAngularEvent )
	{
		if ( $event.stopPropagation ) {
			$event.stopPropagation();
			$event.preventDefault();
		}

		this.notification.go();
		this.onClick.emit( undefined );
	}

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
	}
}
