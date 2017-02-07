angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.data-storage.items', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
