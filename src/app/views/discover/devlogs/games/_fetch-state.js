// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'discover.devlogs.games._fetch', {
// 		url: '/games/:section?query&page',
// 		params: {
// 			section: {
// 				value: 'hot',
// 				squash: true,
// 			},
// 		},
// 		controller: 'Discover.Devlogs.Games._FetchCtrl',
// 		templateUrl: require( './_fetch.html' ),
// 		resolve: {
// 			payload: function( $state, $stateParams, Api, filteringContainer )
// 			{
// 				return filteringContainer.init( 'discover.devlogs.games._fetch', $stateParams )
// 					.then( function()
// 					{
// 						var query = filteringContainer.getQueryString( $stateParams );
// 						return Api.sendRequest( '/web/discover/devlogs/games?' + query );
// 					} );
// 			}
// 		}
// 	} );
// } );
