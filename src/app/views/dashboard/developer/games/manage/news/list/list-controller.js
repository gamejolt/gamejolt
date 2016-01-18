angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.ListCtrl', function( $scope, $stateParams, App, Game_NewsArticle, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'dash.games.news.page_title', { game: $scope.manageCtrl.game.title } );

	this.currentPage = $stateParams.page || 1;
	this.perPage = payload.perPage || 0;
	this.totalCount = payload.newsArticlesCount || 0;

	this.commentCounts = payload.commentCounts || {};
	this.viewCounts = payload.viewCounts || {};

	this.newsArticles = Game_NewsArticle.populate( payload.newsArticles );
} );
