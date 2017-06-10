angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.data-storage', {
		abstract: true,
		url: '/data-storage',
		template: '<ui-view />',
	} );
} );
