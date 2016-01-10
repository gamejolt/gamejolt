angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.scoreboards', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
