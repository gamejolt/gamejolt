angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.devlog', {
		abstract: true,
		template: '<ui-view></ui-view>'
	} );
} );
