angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Developer.Games.Manage.Game.Packages.Release.EditCtrl', function(
	$scope, $state, $stateParams, App, Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption, Game_Build_Param, Game_Build_File, ModalConfirm, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.releases.edit.page_title', {
		game: $scope.manageCtrl.game.title,
		package: $scope.releaseCtrl.packageTitle,
		release: $scope.releaseCtrl.release.version_number,
	} );

	$scope.Game_Release = Game_Release;
	$scope.Game_Build = Game_Build;

	this.onSaved = onSaved;
	this.unpublishRelease = unpublishRelease;
	this.removeRelease = removeRelease;

	function onSaved()
	{
		$state.go( 'dash.games.manage.game.packages.edit', { packageId: $scope.releaseCtrl.package.id } );
	}

	function unpublishRelease( release )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.releases.manage.unpublish_release_confirmation' ) )
			.then( function()
			{
				return release.$unpublish( $scope.manageCtrl['game'] );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.releases.manage.unpublish_release_growl' ),
					gettextCatalog.getString( 'dash.games.releases.manage.unpublish_release_growl_title' )
				);
			} );
	}

	function removeRelease( release )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.releases.manage.remove_release_confirmation' ) )
			.then( function()
			{
				return release.$remove( $scope.manageCtrl['game'] );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.releases.manage.remove_release_growl' ),
					gettextCatalog.getString( 'dash.games.releases.manage.remove_release_growl_title' )
				);

				$state.go( 'dash.games.manage.game.packages.edit', { packageId: $scope.releaseCtrl.package.id } );
			} );
	}
} );
