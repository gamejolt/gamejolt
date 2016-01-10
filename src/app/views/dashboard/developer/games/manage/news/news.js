angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.news', {
		abstract: true,
		url: '/news',
		template: '<ui-view />',
	} );
} );
