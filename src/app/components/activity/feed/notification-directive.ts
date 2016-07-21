import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import template from 'html!./notification.html';

@Component({
	selector: 'gj-activity-feed-notification',
	template,
})
export class NotificationComponent
{
	@Input( '<' ) notification: Notification;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;

	constructor(
		@Inject( 'Notification' ) public notificationModel: typeof Notification,
		@Inject( 'Screen' ) public screen: Screen
	)
	{
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
}
