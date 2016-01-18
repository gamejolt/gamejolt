angular.module( 'App.Views' ).controller( 'Auth.LinkedAccount.Twitter.FinalizeCtrl', function( $state, Growls, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'auth.linked_account.twitter.finalize.page_title' );

	this.onSubmitted = function()
	{
		Growls.success(
			gettextCatalog.getString( 'auth.linked_account.twitter.created_growl' ),
			gettextCatalog.getString( 'auth.linked_account.twitter.created_growl_title' )
		);
		App.redirectDashboard();
	};
} );
