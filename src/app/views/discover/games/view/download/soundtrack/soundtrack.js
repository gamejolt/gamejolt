angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	// http://development.gamejolt.com/games/tea-time-with-luap-sere-make-the-world-right/soundtracks/download/863
	$urlRouterProvider.when( '/games/{slug:string}/soundtracks/download/{id:int}', '/games/:slug/:id/download/soundtrack' );

	// TODO: Don't index this page if the game is hidden.
	$stateProvider.state( 'discover.games.view.download.soundtrack', {
		url: '/soundtrack',
		controller: 'Discover.Games.View.Download.SoundtrackCtrl',
		controllerAs: 'soundtrackCtrl',
		templateUrl: '/app/views/discover/games/view/download/soundtrack/soundtrack.html',
		resolve: {
			tick: function( tickSource, HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-soundtrack', $stateParams.id, { sourceResource: 'Game', sourceResourceId: $stateParams.id } );
			},
		}
	} );
} );
