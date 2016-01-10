angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Package.ReleasesCtrl', function(
	$scope, $state, Translate, App, Game_Release, AutoScroll )
{
	$scope.Game_Release = Game_Release;

	Translate.pageTitle( 'dash.games.packages.manage.releases.page_title', {
		game: $scope.manageCtrl.game.title,
		package: ($scope.packageCtrl.package.title || $scope.manageCtrl.game.title),
	} );

	this.isAdding = false;
	this.activeItem = null;

	this.onReleaseAdded = onReleaseAdded;

	$scope.$watch( 'releasesCtrl.isAdding', isAddingWatcher );

	function onReleaseAdded( release )
	{
		$state.go( 'dashboard.developer.games.manage.packages.release.builds', { packageId: $scope.packageCtrl.package.id, releaseId: release.id } );
	}

	function isAddingWatcher( isAdding )
	{
		AutoScroll.noScroll( true );

		if ( isAdding ) {
			$state.go( 'dashboard.developer.games.manage.packages.package.releases.add', {}, { location: 'replace' } );
		}
		else {
			$state.go( 'dashboard.developer.games.manage.packages.package.releases', {}, { location: 'replace' } );
		}
	}
} );
