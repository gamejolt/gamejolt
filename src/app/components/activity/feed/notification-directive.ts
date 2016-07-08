import { Component, Inject, Input, SkipSelf, Optional } from 'ng-metadata/core';
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

	constructor(
		@Inject( 'Notification' ) private notificationModel: typeof Notification,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	go( $event: ng.IAngularEvent )
	{
		$event.stopPropagation();
		$event.preventDefault();

		this.feed.setActive( this.notification.id );
		this.notification.go();
	}
}
