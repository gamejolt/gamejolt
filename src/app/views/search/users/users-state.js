angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search.users', {
		url: '/search/users?q&page',
		controller: 'Search.ResultsCtrl',
		controllerAs: 'resultsCtrl',
		templateUrl: '/app/views/search/users/users.html',
		resolve: {
			payload: function( $stateParams, Search, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Search.search( $stateParams.q, {
						type: 'user',
						page: $stateParams.page || 1,
					} );
				} );
			}
		}
	} );
} );
