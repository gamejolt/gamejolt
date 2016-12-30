angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.fireside.posts', {
		abstract: true,
		// url: '/posts',
		template: '<ui-view />'
	} );
} );
