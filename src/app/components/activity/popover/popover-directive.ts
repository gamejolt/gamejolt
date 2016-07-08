import { Component, Inject, Output } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { ModalConfirm } from './../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import template from './popover.html';

const COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.
const NOTIFICATIONS_LIMIT = 20;
const INITIAL_LAG = 3000;

@Component({
	selector: 'gj-activity-popover',
	template,
})
export class PopoverComponent
{
	@Output( 'onFocus' ) _onFocus: Function;
	@Output( 'onBlur' ) _onBlur: Function;
	@Output( 'onNotificationsCount' ) _onNotificationsCount: Function;

	private notificationsCount = 0;
	private leftoverCount = 0;
	private notifications: Notification[] = [];

	private isShown = false;
	private isLoading = true;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$interval' ) $interval: ng.IIntervalService,
		@Inject( '$timeout' ) $timeout: ng.ITimeoutService,
		@Inject( '$location' ) $location: ng.ILocationService,
		@Inject( 'App' ) app: App,
		@Inject( 'Notification' ) private notificationModel: typeof Notification,
		@Inject( 'Popover' ) private popover: any,
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
	)
	{
		$scope['App'] = app;
		$scope['Notification'] = notificationModel;

		// Fetch count right away.
		$timeout( () =>
		{
			this.fetchCount();
		}, INITIAL_LAG );

		// Fetch counts every X minutes afterwards.
		const countInterval = $interval( () =>
		{
			this.fetchCount();
		}, COUNT_INTERVAL );

		$scope.$on( '$destroy', () =>
		{
			$interval.cancel( countInterval );
		} );
	}

	onFocus()
	{
		this.isShown = true;
		this.fetchNotifications();
		if ( this._onFocus ) {
			this._onFocus();
		}
	}

	onBlur()
	{
		this.isShown = false;
		if ( this._onBlur ) {
			this._onBlur();
		}
	}

	close()
	{
		this.popover.hideAll();
	}

	go( $event: ng.IAngularEvent, notification: any )
	{
		this.dismiss( $event, notification );
		this.popover.hideAll();
		notification.go();
	}

	private _setCount( count: number )
	{
		this.notificationsCount = count;
		this.leftoverCount = Math.max( 0, count - NOTIFICATIONS_LIMIT );
		if ( this._onNotificationsCount ) {
			this._onNotificationsCount( { $count: this.notificationsCount } );
		}
	}

	dismiss( $event: ng.IAngularEvent, notification: any )
	{
		$event.stopPropagation();
		$event.preventDefault();

		notification.$read()
			.then( response =>
			{
				_.remove( this.notifications, { id: notification.id } );
				this._setCount( response.notificationsCount );

				const fillNotifications = this.notificationModel.populate( response.fillNotifications );

				this.notifications = _( this.notifications )
					.union( fillNotifications )
					.sortBy( 'added_on' )
					.reverse()
					.uniq( true, 'id' )
					.take( NOTIFICATIONS_LIMIT )
					.value();
			} );
	}

	dismissAll()
	{
		this.confirm.show( this.gettextCatalog.getString( 'notifications.clear_all_confirmation' ) )
			.then( () => this.notificationModel.$readAll() )
			.then( () =>
			{
				this.notifications = [];
				this._setCount( 0 );
				this.leftoverCount = 0;
			} );
	}

	fetchCount()
	{
		this.notificationModel.fetchNotificationsCount()
			.then( response => this._setCount( response.notificationsCount ) );
	}

	fetchNotifications()
	{
		this.notificationModel.fetchNotificationsFeed()
			.then( response =>
			{
				this.notifications = response.notifications;
				this._setCount( response.notificationsCount );
				this.isLoading = false;
			} );
	}
}
