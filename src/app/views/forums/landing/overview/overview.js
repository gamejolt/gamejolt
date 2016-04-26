angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/community/forums', '/forums' );
	$urlRouterProvider.when( '/community/forums/rules', '/forums' );

	$stateProvider.state( 'forums.landing.overview', {
		url: '/forums',
		controller: 'Forums.Landing.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/forums/landing/overview/overview.html',
		resolve: {
			payload: function( Api, History_Cache )
			{
				return History_Cache.cache( Api.sendRequest( '/web/forums' ) );
			},
		},
	} );
} );
