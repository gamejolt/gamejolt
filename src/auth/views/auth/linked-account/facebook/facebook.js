angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.facebook', {
		abstract: true,
		url: '/facebook',
		template: '<ui-view/>',
	} );
} );
