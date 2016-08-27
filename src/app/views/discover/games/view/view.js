angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view', {
		abstract: true,
		url: '/{slug:string}/{id:int}?comment_page&ref',
		controller: 'Discover.Games.ViewCtrl',
		controllerAs: 'gameCtrl',
		templateUrl: '/app/views/discover/games/view/view.html',
		resolve: {
			tickSource: function( $stateParams, HistoryTick )
			{
				HistoryTick.trackSource( 'Game', $stateParams.id );
			}
		}
	} );
} );
