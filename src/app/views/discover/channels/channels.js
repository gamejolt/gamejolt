angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels', {
		url: '/channels',
		abstract: true,
		template: '<ui-view></ui-view>',
	} );
} );
