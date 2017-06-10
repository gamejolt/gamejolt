angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.data-storage.items', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
