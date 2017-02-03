angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitter', {
		abstract: true,
		url: '/twitter',
		template: '<ui-view/>',
	} );
} );
