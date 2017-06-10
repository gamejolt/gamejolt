angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.developer', {
		abstract: true,
		template: '<ui-view/>',
	} );
} );
