angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.Manage.Packages.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/add/add.html',
	} );
} );
