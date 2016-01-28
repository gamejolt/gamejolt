angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.list', {
		abstract: true,
		controller: 'Discover.Games.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/list/list.html',
		resolve: {

			// We need translations loaded in for the filtering container, so we wait for "init".
			filteringContainer: function( init, Game_Filtering_Container )
			{
				return new Game_Filtering_Container();
			}
		}
	} );
} );
