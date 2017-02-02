angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search.results', {
		url: '/search?q',
		controller: 'Search.ResultsCtrl',
		controllerAs: 'resultsCtrl',
		templateUrl: require( './results.html' ),
		resolve: {
			payload: function( $stateParams, Search, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Search.search( $stateParams.q );
				} );
			}
		}
	} );
} );
