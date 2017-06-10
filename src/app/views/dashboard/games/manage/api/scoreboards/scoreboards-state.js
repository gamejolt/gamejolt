angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.scoreboards', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
