angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.trophies', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
