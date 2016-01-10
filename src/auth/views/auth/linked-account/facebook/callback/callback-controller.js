angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Facebook.CallbackCtrl', function( $state, $window, Translate, App, payload )
{
	/**
	 * We do this in the controller so that we can show a processing message, just in case it takes a little bit.
	 */
	if ( !payload.success ) {

		if ( payload.reason && payload.reason == 'no-email' ) {
			Translate.growl( 'error', 'auth.linked_account.facebook.no_email' );
			$state.go( 'auth.join' );
		}
		else if ( payload.reason && payload.reason == 'duplicate-email' ) {
			Translate.growl( 'error', 'auth.linked_account.facebook.duplicate_email' );
			$state.go( 'auth.login' );  // Go to login page instead.
		}
		else {
			Translate.growl( 'error', 'auth.linked_account.facebook.failed' );
			$state.go( 'auth.join' );
		}
		return;
	}

	// If a new account was created as part of the login.
	if ( payload.accountCreated ) {
		Translate.growl( 'success', 'auth.linked_account.facebook.created' );
	}

	App.redirectDashboard();
} );
