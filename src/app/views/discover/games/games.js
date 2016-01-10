angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games', {
		abstract: true,
		url: '/games',
		template: '<ui-view/>'
	} );
} );