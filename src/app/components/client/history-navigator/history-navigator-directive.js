angular.module( 'App.Client.HistoryNavigator' ).directive( 'gjClientHistoryNavigator', function( HistoryNavigator )
{
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '/app/components/client/history-navigator/history-navigator.html',
		link: function( scope )
		{
			scope.HistoryNavigator = HistoryNavigator;
		}
	};
} );
