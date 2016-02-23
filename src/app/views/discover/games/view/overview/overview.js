angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/games/{category:arcade|action|adventure|rpg|strategy-sim|platformer|shooter|puzzle|sports|other}/{slug:string}/{id:int}', '/games/:slug/:id' );

	$stateProvider.state( 'discover.games.view.overview', {
		url: '^/games/{slug:string}/{id:int}?comment_page',
		controller: 'Discover.Games.View.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/games/view/overview/overview.html',
		resolve: {
			tick: function( HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-view', $stateParams.id );
			}
		}
	} );
} );
