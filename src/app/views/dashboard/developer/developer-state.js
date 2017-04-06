angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer', {
		abstract: true,
		template: '<ui-view/>',
	} );
} );
