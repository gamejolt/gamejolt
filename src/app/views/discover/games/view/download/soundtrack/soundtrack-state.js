angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	// http://development.gamejolt.com/games/tea-time-with-luap-sere-make-the-world-right/soundtracks/download/863
	$urlRouterProvider.when( '/games/{slug:path}/soundtracks/download/{id:int}', '/games/:slug/:id/download/soundtrack' );

	// TODO: Don't index this page if the game is hidden.
	$stateProvider.state( 'discover.games.view.download.soundtrack', {
		url: '/soundtrack',
		controller: 'Discover.Games.View.Download.SoundtrackCtrl',
		controllerAs: 'soundtrackCtrl',
		templateUrl: require( './soundtrack.html' ),
		resolve: {
			tick: function( tickSource, HistoryTick, $transition$ )
			{
				HistoryTick.sendBeacon( 'game-soundtrack', $transition$.params().id, { sourceResource: 'Game', sourceResourceId: $transition$.params().id } );
			},
		}
	} );
} );
