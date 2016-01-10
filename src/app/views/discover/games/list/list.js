angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.list', {
		abstract: true,
		controller: 'Discover.Games.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/list/list.html',
		resolve: {
			filteringContainer: function( Game_Filtering_Container )
			{
				return new Game_Filtering_Container();
			}
		}
	} );
} );
