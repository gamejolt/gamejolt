angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.media', {
		abstract: true,
		url: '/media',
		template: '<ui-view />',
	} );
} );
