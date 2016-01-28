angular.module( 'App.Notifications.Popover' ).directive( 'gjNotificationsPopover', function()
{
	var COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.
	var NOTIFICATIONS_LIMIT = 20;

	return {
		restrict: 'E',
		templateUrl: '/app/components/notifications/popover/popover.html',
		scope: {},
		bindToController: {
			notificationsCount: '=?',
			isShown: '=?',
		},
		controllerAs: 'ctrl',
		controller: function( $scope, $interval, $location, App, Notification, Popover, ModalConfirm, gettextCatalog )
		{
			var _this = this;

			$scope.App = App;
			$scope.Notification = Notification;

			this.curTime = Date.now();

			this.notificationsCount = undefined;
			this.leftoverCount = undefined;
			this.notifications = [];

			this.isShown = false;
			this.isLoading = true;

			this.onFocus = function()
			{
				this.isShown = true;
				this.fetchNotifications();
			};

			this.onBlur = function()
			{
				this.isShown = false;
			};

			this.close = function()
			{
				Popover.hideAll();
			};

			this.go = function( $event, notification )
			{
				this.dismiss( $event, notification );
				Popover.hideAll();
				notification.go();
			};

			this.setCount = function( count )
			{
				this.notificationsCount = count;
				this.leftoverCount = Math.max( 0, count - NOTIFICATIONS_LIMIT );
			};

			this.dismiss = function( $event, notification )
			{
				$event.stopPropagation();
				$event.preventDefault();

				notification.$read().then( function( response )
				{
					_.remove( _this.notifications, { id: notification.id } );
					_this.setCount( response.notificationsCount );

					var fillNotifications = response.fillNotifications ? Notification.populate( response.fillNotifications ) : [];

					_this.notifications = _( _this.notifications )
						.union( fillNotifications )
						.sortBy( 'added_on' )
						.reverse()
						.uniq( true, 'id' )
						.take( NOTIFICATIONS_LIMIT )
						.value();
				} );
			};

			this.dismissAll = function()
			{
				ModalConfirm.show( gettextCatalog.getString( 'notifications.clear_all_confirmation' ) )
					.then( function()
					{
						return Notification.$readAll();
					} )
					.then( function()
					{
						_this.notifications = [];
						_this.notificationsCount = 0;
						_this.leftoverCount = 0;
					} );
			};

			this.fetchCount = function()
			{
				Notification.fetchNotificationsCount().then( function( response )
				{
					_this.setCount( response.notificationsCount );
				} );
			};

			this.fetchNotifications = function()
			{
				Notification.fetchNotificationsFeed().then( function( response )
				{
					_this.notifications = response.notifications;
					_this.setCount( response.notificationsCount );
					_this.isLoading = false;
				} );
			};

			// Fetch count right away.
			this.fetchCount();

			// Fetch counts every X minutes afterwards.
			var countInterval = $interval( function()
			{
				_this.fetchCount();
			}, COUNT_INTERVAL );

			$scope.$on( '$destroy', function()
			{
				$interval.cancel( countInterval );
			} );
		}
	};
} );
