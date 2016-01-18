angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.Article.EditCtrl', function( $scope, App, Game_NewsArticle, Scroll, Growls, gettextCatalog, payload )
{
	var article = new Game_NewsArticle( payload.newsArticle );
	$scope.articleCtrl.article = article;

	App.title = gettextCatalog.getString( 'dash.games.news.article.edit.page_title', { article: article.title } );

	this.onSaved = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.news.article.edit.save_growl' ),
			gettextCatalog.getString( 'dash.games.news.article.edit.save_growl_title' )
		);
		Scroll.to( 0 );
	};
} );
