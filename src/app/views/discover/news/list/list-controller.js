angular.module( 'App.Views' ).controller( 'Discover.News.ListCtrl', function( $scope, $stateParams, App, Game_NewsArticle, gettextCatalog, payload )
{
	var newsCtrl = $scope.newsCtrl;
	newsCtrl.section = $stateParams.section || 'hot';
	newsCtrl.newsArticlesCount = payload.newsArticlesCount;
	newsCtrl.perPage = payload.perPage;
	newsCtrl.currentPage = $stateParams.page || 1;

	newsCtrl.articles = Game_NewsArticle.populate( payload.newsArticles );

	newsCtrl.rssFeedUrl = payload.rssFeedUrl;
	newsCtrl.atomFeedUrl = payload.atomFeedUrl;

	if ( newsCtrl.section == 'hot' ) {
		App.title = gettextCatalog.getString( 'news.list.all_page_title' );
	}
	else if ( newsCtrl.section == 'followed' ) {
		App.title = gettextCatalog.getString( 'news.list.followed_page_title' );
	}
	else if ( newsCtrl.section == 'in-development' ) {
		App.title = gettextCatalog.getString( 'news.list.wip_page_title' );
	}
	else if ( newsCtrl.section == 'released' ) {
		App.title = gettextCatalog.getString( 'news.list.released_page_title' );
	}
} );
