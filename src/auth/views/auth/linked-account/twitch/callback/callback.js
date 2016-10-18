angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitch.callback', {
		url: '/callback?code&state',
		controller: 'Auth.LinkedAccount.Twitch.CallbackCtrl',
		controllerAs: 'callbackCtrl',
		templateUrl: '/auth/views/auth/linked-account/_processing.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/auth/twitch/callback?code=' + $stateParams.code + '&state=' + $stateParams.state, {} );
			}
		},
	} );
} );
