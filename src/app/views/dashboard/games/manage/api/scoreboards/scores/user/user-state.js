angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.scoreboards.scores.user', {
		abstract: true,
		template: '<ui-view />',
	} );
} );
