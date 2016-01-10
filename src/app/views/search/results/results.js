angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search.results', {
		url: '/search?q',
		controller: 'Search.ResultsCtrl',
		controllerAs: 'resultsCtrl',
		templateUrl: '/app/views/search/results/results.html',
		resolve: {
			payload: function( $stateParams, Search )
			{
				return Search.search( $stateParams.q );
			}
		}
	} );
} );
