angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games', {
		abstract: true,
		url: '/games',
		template: '<ui-view/>'
	} );
} );