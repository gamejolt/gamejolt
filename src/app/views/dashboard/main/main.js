angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main', {
		abstract: true,
		templateUrl: '/app/views/dashboard/main/main.html',
		controllerAs: 'mainCtrl',
		controller: angular.noop,
	} );
} );
