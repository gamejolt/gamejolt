angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.ReleaseCtrl', function(
	$scope, $state, $stateParams, $translate, Translate, App, Game_Package, Game_Release, Game_Build, ModalConfirm, Growls, AutoScroll, payload )
{
	var _this = this;

	$scope.Game_Release = Game_Release;
	$scope.Game_Build = Game_Build;

	// We update the global packages list.
	// This ensures as we edit the package, things stay updated.
	this.package = _.find( $scope.packagesCtrl.packages, { id: payload.package.id } );
	this.package.assign( payload.package );
	this.packageTitle = this.package.title || $scope.manageCtrl.game.title;

	this.release = new Game_Release( payload.release );
	this.releases = Game_Release.populate( payload.releases );
	this.builds = Game_Build.populate( payload.builds );

	this.publishRelease = publishRelease;
	this.unpublishRelease = unpublishRelease;
	this.removeRelease = removeRelease;

	// If the game was entered into a jam that locks its builds.
	this.areBuildsLockedByJam = payload.areBuildsLockedByJam || false;

	function publishRelease( release )
	{
		ModalConfirm.show( $translate.instant( 'dash.games.releases.manage.publish_release_confirmation' ) )
			.then( function()
			{
				return release.$publish();
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.releases.manage.publish_release' );
			} );
	}

	function unpublishRelease( release )
	{
		ModalConfirm.show( $translate.instant( 'dash.games.releases.manage.unpublish_release_confirmation' ) )
			.then( function()
			{
				return release.$unpublish();
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.releases.manage.unpublish_release' );
			} );
	}

	function removeRelease()
	{
		ModalConfirm.show( $translate.instant( 'dash.games.releases.manage.remove_release_confirmation' ) )
			.then( function()
			{
				return _this.release.$remove();
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.releases.manage.remove_release' );
				$state.go( 'dashboard.developer.games.manage.packages.package.releases', { packageId: _this.package.id } );
			} );
	}
} );
