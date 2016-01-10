angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Twitter.CallbackCtrl', function( $state, Translate, App, payload )
{
	/**
	 * We do this in the controller so that we can show a processing message, just in case it takes a little bit.
	 */
	if ( !payload.success ) {

		// If they don't have an account yet, let's create one for them.
		// For Twitter, they need to fill out their email address, so take them to the page to do that.
		if ( payload.reason && payload.reason == 'no-account' ) {
			$state.go( 'auth.linked-account.twitter.finalize' );
		}
		else {
			Translate.growl( 'error', 'auth.linked_account.twitter.failed' );
			$state.go( 'auth.join' );
		}
		return;
	}

	App.redirectDashboard();
} );
