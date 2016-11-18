angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.google', {
		abstract: true,
		url: '/google',
		template: '<ui-view/>',
	} );
} );
