angular.module( 'App.Shell' ).directive( 'gjShellTopNav', function( App, Shell )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/top-nav/top-nav.html',
		scope: true,
		link: function( scope )
		{
			scope.App = App;
			scope.Shell = Shell;
			scope.notificationsCount = 0;
			scope.friendRequestCount = 0;
		}
	};
} );
