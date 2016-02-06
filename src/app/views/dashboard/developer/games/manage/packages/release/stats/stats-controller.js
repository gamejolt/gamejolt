angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Release.StatsCtrl', function( $scope, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.releases.stats.page_title', {
		game: $scope.manageCtrl.game.title,
		package: $scope.releaseCtrl.packageTitle,
		release: $scope.releaseCtrl.release.version_number,
	} );
} );
