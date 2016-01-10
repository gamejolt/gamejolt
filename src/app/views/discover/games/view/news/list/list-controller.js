angular.module( 'App.Views' ).controller( 'Discover.Games.View.News.ListCtrl', function( $scope, $state, $stateParams, App, Meta, Game_NewsArticle, payload )
{
	App.title = 'News Updates for ' + $scope.gameCtrl.game.title;
	Meta.description = 'View all the latest news update for ' + $scope.gameCtrl.game.title + ' on Game Jolt';

	this.newsArticles = Game_NewsArticle.populate( payload.newsArticles );

	this.rssFeedUrl = payload.rssFeedUrl;
	this.atomFeedUrl = payload.atomFeedUrl;

	this.newsArticlesCount = payload.newsArticlesCount || 0;
	this.perPage = payload.perPage;
	this.currentPage = $stateParams.page || 1;
} );
