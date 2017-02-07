angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitter.finalize', {
		url: '/finalize?state',
		controller: 'Auth.LinkedAccount.Twitter.FinalizeCtrl',
		controllerAs: 'finalizeCtrl',
		templateUrl: require( './finalize.html' ),
	} );
} );
