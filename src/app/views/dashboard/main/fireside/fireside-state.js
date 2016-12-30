angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.fireside', {
		abstract: true,
		url: '/fireside',
		template: '<ui-view></ui-view>',
	} );
} );
