import { Component, Inject, Input } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from './feed.html';

@Component({
	selector: 'gj-activity-feed',
	template,
})
export class FeedComponent
{
	@Input( '<' ) notifications: any[];

	constructor(
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Notification' ) private notificationModel: any,
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post
	)
	{
		console.log( 'hi!', this.notifications );
	}

	markRead( $event: ng.IAngularEvent, notification: any )
	{
		$event.stopPropagation();
		$event.preventDefault();

		// No need to do anything after marking it read.
		// Don't want to remove it from view.
		notification.$read();
	}

	go( $event: ng.IAngularEvent, notification: any )
	{
		$event.stopPropagation();
		$event.preventDefault();

		notification.$read();
		notification.go();
	}
}
