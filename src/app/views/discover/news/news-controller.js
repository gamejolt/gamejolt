angular.module( 'App.Views' ).controller( 'Discover.NewsCtrl', function( $scope, $translate, Game_NewsArticle )
{
	this.section = null;
	this.newsArticlesCount = 0;
	this.perPage = 30;
	this.currentPage = 1;
	this.articles = [];

	this.sortingOptions = {
		'': $translate.instant( 'sorting.hot' ),
		'new': $translate.instant( 'sorting.new' ),
	};
} );
