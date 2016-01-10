angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds', {
		url: '/builds',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Release.BuildsCtrl',
		controllerAs: 'buildsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/release/builds/builds.html',
	} );
} );
