angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.ReleaseCtrl', function(
	$scope, $state, $stateParams, App, Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption, Game_Build_Param, Game_Build_File, ModalConfirm, Growls, gettextCatalog, payload )
{
	// We update the global packages list.
	// This ensures as we edit the package, things stay updated.
	this.package = new Game_Package( payload.package );
	this.packageTitle = this.package.title || $scope.manageCtrl.game.title;

	this.release = new Game_Release( payload.release );
	this.releases = Game_Release.populate( payload.releases );
	this.builds = Game_Build.populate( payload.builds );
	this.launchOptions = Game_Build_LaunchOption.populate( payload.launchOptions );

	this.buildDownloadCounts = payload.buildDownloadCounts;

	// If the game was entered into a jam that locks its builds.
	this.areBuildsLockedByJam = payload.areBuildsLockedByJam || false;
	this.areWebBuildsLockedBySellable = ( payload.package.is_in_paid_sellable || payload.package.has_sales ) || false;
} );
