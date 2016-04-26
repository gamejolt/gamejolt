angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitter.callback', {
		url: '/callback?oauth_verifier&state',
		controller: 'Auth.LinkedAccount.Twitter.CallbackCtrl',
		controllerAs: 'callbackCtrl',
		templateUrl: '/auth/views/auth/linked-account/_processing.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/auth/twitter/callback?oauth_verifier=' + $stateParams.oauth_verifier + '&state=' + $stateParams.state, {} );
			}
		},
	} );
} );
