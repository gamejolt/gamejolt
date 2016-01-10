angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitter.finalize', {
		url: '/finalize',
		controller: 'Auth.LinkedAccount.Twitter.FinalizeCtrl',
		controllerAs: 'finalizeCtrl',
		templateUrl: '/auth/views/auth/linked-account/twitter/finalize/finalize.html',
	} );
} );
