angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.news.article.edit', {
		url: '/edit',
		controller: 'Dashboard.Developer.Games.Manage.News.Article.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/news/article/edit/edit.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/news/' + $stateParams.id + '/' + $stateParams.articleId );
			}
		}
	} );
} );
