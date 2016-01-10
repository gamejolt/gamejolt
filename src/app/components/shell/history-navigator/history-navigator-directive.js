angular.module( 'App.Shell' ).directive( 'gjShellHistoryNavigator', function( HistoryNavigator )
{
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '/app/components/shell/history-navigator/history-navigator.html',
		link: function( scope )
		{
			scope.HistoryNavigator = HistoryNavigator;
		}
	};
} );