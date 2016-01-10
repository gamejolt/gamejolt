angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums', {
		abstract: true,
		template: '<ui-view></ui-view>',
	} );
} );
