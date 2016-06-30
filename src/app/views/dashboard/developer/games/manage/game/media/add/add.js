angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.media.add', {
		redirectTo: 'dashboard.developer.games.manage.media.add.image',
		url: '/add',
		controller: 'Dashboard.Developer.Games.Manage.Media.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/media/add/add.html',
	} );
} );
