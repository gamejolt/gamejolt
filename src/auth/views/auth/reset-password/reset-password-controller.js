angular.module( 'App.Views' ).controller( 'Auth.ResetPasswordCtrl', function( $state, $stateParams, Translate, payload )
{
	Translate.pageTitle( 'auth.reset_password.page_title' );

	this.userId = $stateParams.userId;
	this.key = $stateParams.key;

	this.onSubmitted = function()
	{
		Translate.growl( 'success', 'auth.reset_password.success' );
		$state.go( 'auth.login' );
	};
} );
