angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Release.EditCtrl', function(
	$scope, $state, App, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.releases.edit.page_title', {
		game: $scope.manageCtrl.game.title,
		package: $scope.releaseCtrl.packageTitle,
		release: $scope.releaseCtrl.release.version_number,
	} );

	this.onEdited = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.releases.edit.saved_growl' ),
			gettextCatalog.getString( 'dash.games.releases.edit.saved_growl_title' )
		);
		$state.go( '^.builds' );
	};
} );
