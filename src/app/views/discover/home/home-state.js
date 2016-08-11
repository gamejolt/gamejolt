angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.home', {
		url: '/',
		controller: 'Discover.HomeCtrl',
		controllerAs: 'homeCtrl',
		templateUrl: '/app/views/discover/home/home.html',
		resolve: {
			payload: function( Api, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Api.sendRequest( '/web/discover' );
				} );
			}
		}
	} );
} );
