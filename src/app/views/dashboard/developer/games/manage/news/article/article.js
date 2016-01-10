angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.news.article', {
		abstract: true,
		url: '/{articleId:int}',
		controller: 'Dashboard.Developer.Games.Manage.News.ArticleCtrl',
		controllerAs: 'articleCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/news/article/article.html',
	} );
} );
