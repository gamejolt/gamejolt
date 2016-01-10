angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search.games', {
		url: '/search/games?q&page',
		controller: 'Search.ResultsCtrl',
		controllerAs: 'resultsCtrl',
		templateUrl: '/app/views/search/games/games.html',
		resolve: {
			payload: function( $stateParams, Search )
			{
				return Search.search( $stateParams.q, {
					type: 'game',
					page: $stateParams.page || 1,
				} );
			}
		}
	} );
} );
