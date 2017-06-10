angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.scoreboards.scores', {
		abstract: true,
		url: '/scoreboards/{table:int}',
		template: '<ui-view />',
	} );
} );
