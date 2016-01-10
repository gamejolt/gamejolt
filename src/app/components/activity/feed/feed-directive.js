angular.module( 'App.Activity.Feed' ).directive( 'gjActivityFeed', function()
{
	return {
		restrict: 'E',
		scope: {
			notifications: '=activityFeedNotifications',
		},
		templateUrl: '/app/components/activity/feed/feed.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Screen, Notification )
		{
			$scope.Screen = Screen;
			$scope.Notification = Notification;

			this.markRead = function( $event, notification )
			{
				$event.stopPropagation();
				$event.preventDefault();

				// No need to do anything after marking it read.
				// Don't want to remove it from view.
				notification.$read();
			};

			this.go = function( $event, notification )
			{
				$event.stopPropagation();
				$event.preventDefault();

				notification.$read();
				notification.go();
			};
		}
	};
} );
