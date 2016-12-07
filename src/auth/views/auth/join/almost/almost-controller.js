angular.module( 'App.Views' ).controller( 'Auth.Join.AlmostCtrl', function( $state, $scope, Api, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'auth.join.almost.page_title' );

	this.credentials = {
		username: sessionStorage.getItem( 'auth-user' ),
		password: sessionStorage.getItem( 'auth-pass' ),
	};

	this.onAuthorized = function()
	{
		if ( !this.credentials.username || !this.credentials.password ) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		Api.sendRequest( '/web/auth/login', this.credentials ).then( function( response )
		{
			if ( !response.success ) {
				return;
			}

			// If it worked, redirect to dashboard. They're good to go!
			App.redirectDashboard();
		} );
	};
} );
