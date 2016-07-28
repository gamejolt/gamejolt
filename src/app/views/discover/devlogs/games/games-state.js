angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.devlogs.games', {
		abstract: true,
		controller: 'Discover.Devlogs.GamesCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/discover/devlogs/games/games.html',
		resolve: {

			// We need translations loaded in for the filtering container, so we wait for "init".
			filteringContainer: function( init, Game_Filtering_Container )
			{
				var filteringContainer = new Game_Filtering_Container();

				filteringContainer.isPersistent = false;
				filteringContainer.shouldDetect = false;

				return filteringContainer;
			}
		}
	} );
} );
