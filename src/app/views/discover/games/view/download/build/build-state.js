angular.module( 'App.Views' ).config( function( $stateProvider )
{
	// TODO: Don't index this page if the game is hidden.
	$stateProvider.state( 'discover.games.view.download.build', {
		url: '/build/{buildId:int}',
		controller: 'Discover.Games.View.Download.BuildCtrl',
		controllerAs: 'buildCtrl',
		templateUrl: require( './build.html' ),
		resolve: {
			payload: function( Api, $transition$ )
			{
				return Api.sendRequest( '/web/discover/games/builds/download-page/' + $transition$.params().id + '/' + $transition$.params().buildId );
			},
			tick: function( tickSource, HistoryTick, $transition$ )
			{
				HistoryTick.sendBeacon( 'game-build', $transition$.params().buildId, { sourceResource: 'Game', sourceResourceId: $transition$.params().id } );
			},
		}
	} );
} );
