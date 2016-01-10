angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$stateProvider.state( 'discover.games.view.news.view', {
		url: '/news/{articleSlug:string}/{articleId:int}?comment_page',
		controller: 'Discover.Games.View.News.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/discover/games/view/news/view/view.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/news/' + $stateParams.id + '/' + $stateParams.articleId );
			},
			tick: function( HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-news-article', $stateParams.articleId );
			},
		}
	} );
} );
