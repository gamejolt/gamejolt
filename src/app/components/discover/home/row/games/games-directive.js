angular.module( 'App.Views' ).directive( 'gjDiscoverHomeRowGames', function( Screen )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/discover/home/row/games/games.html',
		link: function( scope )
		{
			scope.Screen = Screen;
		}
	};
} );
