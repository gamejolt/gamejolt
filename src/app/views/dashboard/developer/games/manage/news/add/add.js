angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.news.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.Manage.News.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/news/add/add.html',
	} );
} );
