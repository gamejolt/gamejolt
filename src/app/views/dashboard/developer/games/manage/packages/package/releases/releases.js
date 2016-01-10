angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.package.releases', {
		url: '/releases',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Package.ReleasesCtrl',
		controllerAs: 'releasesCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/package/releases/releases.html',
	} );
} );
