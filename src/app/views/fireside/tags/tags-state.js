angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'fireside.tags', {
		abstract: true,
		template: '<ui-view/>'
	} );
} );
