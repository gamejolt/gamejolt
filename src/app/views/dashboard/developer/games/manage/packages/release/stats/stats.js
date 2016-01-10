angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.stats', {
		url: '/stats',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/release/stats/stats.html',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Release.StatsCtrl',
		controllerAs: 'statsCtrl',
	} );
} );
