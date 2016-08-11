angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.PollCtrl', function( $stateParams, $state, App, Growls, Client )
{
	App.title = 'Waiting for Login';

	this.token = $stateParams.token;
	this.isPolling = true;

	this.completed = function( response )
	{
		// Redirect them off to complete their social login like normal.
		if ( response.provider == 'facebook' ) {
			$state.go( 'auth.linked-account.facebook.callback', { code: response.code, state: this.token } );
		}
		else if ( response.provider == 'twitter' ) {
			$state.go( 'auth.linked-account.twitter.callback', { oauth_verifier: response['oauth-verifier'], state: this.token } );
		}
		else if ( response.provider == 'google' ) {
			$state.go( 'auth.linked-account.google.callback', { code: response.code, state: this.token } );
		}

		this.isPolling = false;

		// Focus back to the Client.
		Client.show();
	};

	this.failed = function( response )
	{
		Growls.error( 'Could not authorize.', 'Authorization Failed' );
		$state.go( 'auth.login' );
	};
} );
