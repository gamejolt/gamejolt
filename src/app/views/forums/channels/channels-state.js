angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.channels', {
		abstract: true,
		template: '<ui-view></ui-view>',
	} );
} );
