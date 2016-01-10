angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account-mobile-nav', {
		url: '/account/nav',
		templateUrl: '/app/views/dashboard/account/mobile-nav.html',
		controller: angular.noop,
	} );
} );