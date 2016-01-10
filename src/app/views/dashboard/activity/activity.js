angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.activity', {
		abstract: true,
		template: '<ui-view/>',
	} );
} );
