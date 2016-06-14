angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.devlog.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.Manage.Devlog.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/devlog/add/add.html',
	} );
} );
