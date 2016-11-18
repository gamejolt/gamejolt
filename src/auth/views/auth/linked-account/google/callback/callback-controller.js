angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Google.CallbackCtrl', function( $state, $window, App, Growls, gettextCatalog, payload )
{
	/**
	 * We do this in the controller so that we can show a processing message, just in case it takes a little bit.
	 */
	if ( !payload.success ) {

		if ( payload.reason && payload.reason == 'no-email' ) {
			Growls.error(
				gettextCatalog.getString( 'Your Google+ account did not return an email address. Make sure you have verified it with Google.' ),
				gettextCatalog.getString( 'Oh no!' )
			);
			$state.go( 'auth.join' );
		}
		else if ( payload.reason && payload.reason == 'duplicate-email' ) {
			Growls.error(
				gettextCatalog.getString( 'The email address on this Google+ account is already in use. Perhaps you already have an account?' ),
				gettextCatalog.getString( 'Oh no!' )
			);
			$state.go( 'auth.login' );  // Go to login page instead.
		}
		else {
			Growls.error(
				gettextCatalog.getString( 'Unable to log in with Google+.' ),
				gettextCatalog.getString( 'Login Failed' )
			);
			$state.go( 'auth.join' );
		}
		return;
	}

	// If a new account was created as part of the login.
	if ( payload.accountCreated ) {
		Growls.success(
			gettextCatalog.getString( "Your account has been created. It's smooth sailing from here on out!" ),
			gettextCatalog.getString( 'Account Created' )
		);
	}

	App.redirectDashboard();
} );
