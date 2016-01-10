angular.module( 'App.Shell' ).directive( 'gjShellTopNav', function( Shell, Chat )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/top-nav/top-nav.html',
		scope: true,
		link: function( scope )
		{
			scope.Shell = Shell;
			scope.Chat = Chat;
			scope.notificationsCount = 0;
			scope.friendRequestCount = 0;
		}
	};
} );
