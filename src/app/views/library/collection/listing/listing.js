angular.module( 'App.Views' ).config( function( $stateProvider )
{
	var queryParams = '?price&sort&os&browser&maturity&status&referrals&query&page';

	var subStates = {
		'playlist': '^/playlist/:slug/:id',
		'followed': '^/@:id/followed',
		'developer': '^/@:id/games',
		'owned': '^/@:id/owned',
		'recommended': '^/@:id/recommended',
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
				payload: function( $state, $stateParams, Api, GameCollection, filteringContainer )
				{
					return filteringContainer.init( 'library.collection.' + state, $stateParams )
						.then( function()
						{
							var query = filteringContainer.getQueryString( $stateParams );

							// We needed to take it out for the state params so we can pattern match better.
							// We add it back in when submitting to API.
							var id = $stateParams.id;
							if ( GameCollection.USER_TYPES.indexOf( state ) !== -1 ) {
								id = '@' + id;
							}

							return Api.sendRequest( '/web/library/games/' + state + '/' + id + '?' + query );
						} );
				}
			}
		} );
	} );
} );
