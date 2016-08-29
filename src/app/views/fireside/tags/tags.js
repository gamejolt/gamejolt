angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'tags', {
		abstract: true,
		template: '<ui-view/>'
	} );
} );