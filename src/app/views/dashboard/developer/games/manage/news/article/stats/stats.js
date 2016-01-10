angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.news.article.stats', {
		url: '/stats',
		controller: 'Dashboard.Developer.Games.Manage.News.Article.StatsCtrl',
		controllerAs: 'statsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/news/article/stats/stats.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/news/' + $stateParams.id + '/' + $stateParams.articleId );
			}
		}
	} );
} );
