import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { FeedComponent } from './feed-directive';
import template from './notification.html';

@Component({
	selector: 'gj-activity-feed-notification',
	template,
})
export class NotificationComponent
{
	@Input( '<' ) notification: Notification;
	@Output() onClick: Function;

	constructor(
		@Inject( 'Notification' ) private notificationModel: typeof Notification,
		@Inject( 'Screen' ) private screen: Screen
	)
	{
	}

	go( $event: ng.IAngularEvent )
	{
		$event.stopPropagation();
		$event.preventDefault();

		this.notification.go();
		this.onClick();
	}
}
