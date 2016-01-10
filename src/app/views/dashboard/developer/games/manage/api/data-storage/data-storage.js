angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.data-storage', {
		abstract: true,
		url: '/data-storage',
		template: '<ui-view />',
	} );
} );
