angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'marketplace.keys', {
		url: '/marketplace/keys',
		controller: 'Marketplace.KeysCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/marketplace/keys/keys.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/marketplace/keys' );
			},
		}
	} );
} );
