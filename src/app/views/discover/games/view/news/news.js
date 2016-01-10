angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.news', {
		abstract: true,
		template: '<ui-view></ui-view>'
	} );
} );
