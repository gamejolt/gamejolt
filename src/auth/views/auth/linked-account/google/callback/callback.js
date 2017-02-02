angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.google.callback', {
		url: '/callback?code&state',
		controller: 'Auth.LinkedAccount.Google.CallbackCtrl',
		controllerAs: 'callbackCtrl',
		templateUrl: require( './_processing.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/auth/google/callback?code=' + $stateParams.code + '&state=' + $stateParams.state, {} );
			}
		},
	} );
} );
