angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.devlog', {
		abstract: true,
		url: '/devlog',
		template: '<ui-view></ui-view>',
	} );
} );
