angular.module( 'App.Views' ).controller( 'Auth.ResetPasswordCtrl', function( $state, $stateParams, App, Growls, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'auth.reset_password.page_title' );

	this.userId = $stateParams.userId;
	this.key = $stateParams.key;

	this.onSubmitted = function()
	{
		Growls.success(
			gettextCatalog.getString( 'auth.reset_password.success_growl' ),
			gettextCatalog.getString( 'auth.reset_password.success_growl_title' )
		);
		$state.go( 'auth.login' );
	};
} );
