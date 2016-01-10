angular.module( 'App.Views' ).controller( 'Auth.ForgotCtrl', function( $state, Translate )
{
	Translate.pageTitle( 'auth.forgot.page_title' );

	this.onSubmitted = function()
	{
		$state.go( 'auth.forgot.sent' );
	};
} );
