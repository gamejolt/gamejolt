import { Directive, Inject, Output } from 'ng-metadata/core';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';

const COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.
const INITIAL_LAG = 3000;

@Directive({
	selector: '[gj-activity-notification-count]',
})
export class NotificationCountComponent
{
	@Output( 'gjActivityNotificationCount' ) onNotificationsCount: Function;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$interval' ) $interval: ng.IIntervalService,
		@Inject( '$timeout' ) $timeout: ng.ITimeoutService,
		@Inject( 'Notification' ) private notificationModel: typeof Notification
	)
	{
		$timeout( () => this.fetchCount(), INITIAL_LAG );

		const countInterval = $interval( () => this.fetchCount(), COUNT_INTERVAL );
		$scope.$on( '$destroy', () => $interval.cancel( countInterval ) );

		// Can emit this to refresh the notification counts when they've changed.
		$scope.$on( 'NotificationCount.refresh', () => this.fetchCount() );
	}

	fetchCount()
	{
		this.notificationModel.fetchNotificationsCount()
			.then( ( response: any ) => this.onNotificationsCount( { $count: response.notificationsCount } ) );
	}
}
