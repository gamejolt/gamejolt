angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'client', {
		url: '/client',
		controller: 'ClientCtrl',
		controllerAs: 'clientCtrl',
		templateUrl: require( './client.html' ),
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/client' );
			},
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
		}
	} );
} );
