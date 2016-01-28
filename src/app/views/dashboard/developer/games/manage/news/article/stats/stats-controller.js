angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.Article.StatsCtrl', function( $scope, App, Game_NewsArticle, gettextCatalog, payload )
{
	var article = new Game_NewsArticle( payload.newsArticle );
	$scope.articleCtrl.article = article;

	App.title = gettextCatalog.getString( 'dash.games.news.article.stats.page_title', { article: article.title } );
} );
