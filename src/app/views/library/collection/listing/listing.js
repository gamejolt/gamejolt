angular.module( 'App.Views' ).config( function( $stateProvider )
{
	var queryParams = '?price&sort&os&browser&maturity&status&referrals&query&page';

	var subStates = {
		'playlist': '^/playlist/:slug/:id',
		'followed': '^/profile/:slug/:id/followed',
		'developer': '^/profile/:slug/:id/games',
		'owned': '^/profile/:slug/:id/owned',
		'bundle': '^/library/bundle/:slug/:id/games',
		'tag': '^/tag/:id',
	};

	angular.forEach( subStates, function( url, state )
	{
		$stateProvider.state( 'library.collection.' + state, {
			url: url + queryParams,
			controller: 'Library.Collection.ListingCtrl',
			controllerAs: 'listingCtrl',
			templateUrl: '/app/views/library/collection/listing/listing.html',
			data: {
				collectionType: state,
			},
			resolve: {
				payload: function( $state, $stateParams, Api, filteringContainer )
				{
					return filteringContainer.init( 'library.collection.' + state, $stateParams )
						.then( function()
						{
							var query = filteringContainer.getQueryString( $stateParams );
							return Api.sendRequest( '/web/library/games/' + state + '/' + $stateParams.id + '?' + query );
						} );
				}
			}
		} );
	} );
} );
