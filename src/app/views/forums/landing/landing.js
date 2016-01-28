angular.module( 'App.Views' ).config( function( $stateProvider )
{
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
