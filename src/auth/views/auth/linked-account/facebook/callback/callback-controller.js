angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Facebook.CallbackCtrl', function( $state, $window, App, Growls, gettextCatalog, payload )
{
	/**
	 * We do this in the controller so that we can show a processing message, just in case it takes a little bit.
	 */
	if ( !payload.success ) {

		if ( payload.reason && payload.reason == 'no-email' ) {
			Growls.error(
				gettextCatalog.getString( 'auth.linked_account.facebook.no_email_growl' ),
				gettextCatalog.getString( 'auth.linked_account.facebook.no_email_growl_title' )
			);
			$state.go( 'auth.join' );
		}
		else if ( payload.reason && payload.reason == 'duplicate-email' ) {
			Growls.error(
				gettextCatalog.getString( 'auth.linked_account.facebook.duplicate_email_growl' ),
				gettextCatalog.getString( 'auth.linked_account.facebook.duplicate_email_growl_title' )
			);
			$state.go( 'auth.login' );  // Go to login page instead.
		}
		else {
			Growls.error(
				gettextCatalog.getString( 'auth.linked_account.facebook.failed_growl' ),
				gettextCatalog.getString( 'auth.linked_account.facebook.failed_growl_title' )
			);
			$state.go( 'auth.join' );
		}
		return;
	}

	// If a new account was created as part of the login.
	if ( payload.accountCreated ) {
		Growls.success(
			gettextCatalog.getString( 'auth.linked_account.facebook.created_growl' ),
			gettextCatalog.getString( 'auth.linked_account.facebook.created_growl_title' )
		);
	}

	App.redirectDashboard();
} );
