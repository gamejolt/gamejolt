angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.Article.EditCtrl', function( $scope, Translate, Game_NewsArticle, Scroll, payload )
{
	var article = new Game_NewsArticle( payload.newsArticle );
	$scope.articleCtrl.article = article;

	Translate.pageTitle( 'dash.games.news.article.edit.page_title', { article: article.title } );

	this.onSaved = function()
	{
		Translate.growl( 'success', 'dash.games.news.article.edit.save' );
		Scroll.to( 0 );
	};
} );
