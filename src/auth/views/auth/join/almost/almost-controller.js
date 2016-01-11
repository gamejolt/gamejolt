angular.module( 'App.Views' ).controller( 'Auth.Join.AlmostCtrl', function( $state, $scope, Translate, Api, App )
{
	Translate.pageTitle( 'auth.join.almost.page_title' );

	this.onAuthorized = function()
	{
		if ( !App.credentials.username || !App.credentials.password ) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		Api.sendRequest( '/web/auth/login', App.credentials ).then( function( response )
		{
			if ( !response.success ) {
				return;
			}

			// If it worked, redirect to dashboard. They're good to go!
			App.redirectDashboard();
		} );
	};
} );
