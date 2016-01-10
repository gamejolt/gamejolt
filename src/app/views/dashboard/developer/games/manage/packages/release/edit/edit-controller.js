angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Release.EditCtrl', function(
	$scope, $state, Translate, App, Growls )
{
	Translate.pageTitle( 'dash.games.releases.edit.page_title', {
		game: $scope.manageCtrl.game.title,
		package: $scope.releaseCtrl.packageTitle,
		release: $scope.releaseCtrl.release.version_number,
	} );

	this.onEdited = function()
	{
		Translate.growl( 'success', 'dash.games.releases.edit.saved' );
		$state.go( '^.builds' );
	};
} );
