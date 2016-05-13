angular.module( 'App.Views' ).config( function( $stateProvider )
{
	// TODO: Don't index this page if the game is hidden.
	$stateProvider.state( 'discover.games.view.download.build', {
		url: '/build/{buildId:int}',
		controller: 'Discover.Games.View.Download.BuildCtrl',
		controllerAs: 'buildCtrl',
		templateUrl: '/app/views/discover/games/view/download/build/build.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/builds/download-page/' + $stateParams.id + '/' + $stateParams.buildId );
			},
			tick: function( tickSource, HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-build', $stateParams.buildId, { sourceResource: 'Game', sourceResourceId: $stateParams.id } );
			},
		}
	} );
} );
