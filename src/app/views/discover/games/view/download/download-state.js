angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.download', {
		abstract: true,
		url: '/download',
		template: '<ui-view></ui-view>'
	} );
} );
