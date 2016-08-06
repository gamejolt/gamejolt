import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from './../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedItem } from './../item-service';
import template from 'html!./notification.html';

@Component({
	selector: 'gj-activity-feed-notification',
	template,
})
export class NotificationComponent
{
	@Input( '<' ) item: ActivityFeedItem;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;

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
		this.onClick();
	}

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
	}
}
