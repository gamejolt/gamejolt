angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.poll', {
		url: '/linked-account/poll?token',
		templateUrl: require( './poll.html' ),
		controllerAs: 'pollCtrl',
		controller: 'Auth.LinkedAccount.PollCtrl',
	} );
} );
