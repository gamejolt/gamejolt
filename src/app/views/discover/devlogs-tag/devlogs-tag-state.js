angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.devlogs-tag', {
		url: '^/tag/:tag/posts',
		controller: 'Discover.DevlogsTagCtrl',
		controllerAs: 'tagCtrl',
		templateUrl: require( './devlogs-tag.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/devlogs-tag/' + $stateParams['tag'] );
			},
		}
	} );
} );
