angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics', {
		abstract: true,
		template: '<ui-view></ui-view>',
	} );
} );
