angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.Article.StatsCtrl', function( $scope, Translate, Game_NewsArticle, payload )
{
	var article = new Game_NewsArticle( payload.newsArticle );
	$scope.articleCtrl.article = article;

	Translate.pageTitle( 'dash.games.news.article.stats.page_title', { article: article.title } );
} );
