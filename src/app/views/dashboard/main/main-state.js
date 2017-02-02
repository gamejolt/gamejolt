angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main', {
		abstract: true,
		templateUrl: require( './main.html' ),
		controllerAs: 'mainCtrl',
		controller: angular.noop,
	} );
} );
