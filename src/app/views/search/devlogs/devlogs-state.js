angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search.devlogs', {
		url: '/search/devlogs?q&page',
		controller: 'Search.ResultsCtrl',
		controllerAs: 'resultsCtrl',
		templateUrl: require( './devlogs.html' ),
		resolve: {
			payload: function( $stateParams, Search, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Search.search( $stateParams.q, {
						type: 'devlog',
						page: $stateParams.page || 1,
					} );
				} );
			}
		}
	} );
} );
