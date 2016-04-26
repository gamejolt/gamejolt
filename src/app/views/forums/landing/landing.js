angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$stateProvider.state( 'forums.landing', {
		abstract: true,
		controller: 'Forums.LandingCtrl',
		controllerAs: 'landingCtrl',
		templateUrl: '/app/views/forums/landing/landing.html',
	} );
} );
