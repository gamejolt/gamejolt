angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/games/{category:arcade|action|adventure|rpg|strategy-sim|platformer|shooter|puzzle|sports|other}/{slug:string}/{id:int}', '/games/:slug/:id' );

	$stateProvider.state( 'discover.games.view.overview', {
		url: '',
		controller: 'Discover.Games.View.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/games/view/overview/overview.html',
		resolve: {
			tick: function( tickSource, HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-view', $stateParams.id, { sourceResource: 'Game', sourceResourceId: $stateParams.id } );
			}
		},
		skipTrackPageview: true,
	} );
} );
