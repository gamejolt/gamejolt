angular.module( 'App.Views' ).controller( 'Auth.ForgotCtrl', function( $state, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'auth.forgot.page_title' );

	this.onSubmitted = function()
	{
		$state.go( 'auth.forgot.sent' );
	};
} );
