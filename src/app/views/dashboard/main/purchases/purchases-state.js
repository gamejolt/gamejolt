angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.purchases', {
		abstract: true,
		url: '/purchases',
		template: '<ui-view></ui-view>',
	} );
} );
