angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.ListCtrl', function( $scope, $stateParams, Translate, Game_NewsArticle, payload )
{
	Translate.pageTitle( 'dash.games.news.page_title', { game: $scope.manageCtrl.game.title } );

	this.currentPage = $stateParams.page || 1;
	this.perPage = payload.perPage || 0;
	this.totalCount = payload.newsArticlesCount || 0;

	this.commentCounts = payload.commentCounts || {};
	this.viewCounts = payload.viewCounts || {};

	this.newsArticles = Game_NewsArticle.populate( payload.newsArticles );
} );
