angular.module( 'App.Views' ).controller( 'Auth.LoginCtrl', function( $stateParams, $state, $window, $location, Environment, Translate, App, User_LinkedAccounts )
{
	Translate.pageTitle( 'auth.login.page_title' );

	this.onLoggedIn = function( formModel )
	{
		if ( $stateParams.redirect ) {

			// We don't want them to be able to put in an offsite link as the redirect URL.
			// So we only open up certain domains.
			// Otherwise we simply attach it to the main domain.

			// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
			if ( $stateParams.redirect.search( /^https?:\/\/([a-zA-Z\.]+\.)gamejolt.(com|io)/ ) !== -1 ) {
				$window.location = $stateParams.redirect;
				return;
			}

			// Normal redirect, within the gamejolt.com domain.
			// Since that's the case, we can set through $location so it doesn't have to reload the scripts.
			$window.location = Environment.baseUrl + $stateParams.redirect;
			return;
		}

		App.redirectDashboard();
	};

	this.linkedAccountLogin = function( provider )
	{
		User_LinkedAccounts.login( provider );
	};
} );
