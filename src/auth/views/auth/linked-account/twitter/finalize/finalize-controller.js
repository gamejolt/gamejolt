angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Twitter.FinalizeCtrl', function( $state, Translate, App )
{
	Translate.pageTitle( 'auth.linked_account.twitter.finalize.page_title' );

	this.onSubmitted = function()
	{
		Translate.growl( 'success', 'auth.linked_account.twitter.created' );
		App.redirectDashboard();
	};
} );
