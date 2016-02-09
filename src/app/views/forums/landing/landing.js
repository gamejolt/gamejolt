angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/community/forums', '/forums' );
	$urlRouterProvider.when( '/community/forums/rules', '/forums' );

	$stateProvider.state( 'forums.landing', {
		url: '/forums',
		controller: 'Forums.LandingCtrl',
		controllerAs: 'landingCtrl',
		templateUrl: '/app/views/forums/landing/landing.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/forums' );
			},
		},
	} );
} );
