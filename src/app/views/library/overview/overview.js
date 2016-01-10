angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/game-library', '/library' );

	$stateProvider.state( 'library.overview', {
		url: '^/library',
		controller: 'Library.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/library/overview/overview.html',
		data: {
			availableOffline: true,
		},
	} );
} );
