angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.linked-account.twitch', {
		abstract: true,
		url: '/twitch',
		template: '<ui-view/>',
	} );
} );
