angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.scores', {
		abstract: true,
		url: '/scores',
		template: '<ui-view />',
	} );
} );
