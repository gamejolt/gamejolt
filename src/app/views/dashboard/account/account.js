angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account', {
		abstract: true,
		templateUrl: '/app/views/dashboard/account/account.html',
		controllerAs: 'accountCtrl',
		controller: angular.noop,
	} );
} );