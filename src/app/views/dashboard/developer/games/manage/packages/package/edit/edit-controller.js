angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Package.EditCtrl', function( $scope, $state, Translate, App, Growls )
{
	Translate.pageTitle( 'dash.games.packages.edit.page_title', {
		game: $scope.manageCtrl.game.title,
		package: ($scope.packageCtrl.package.title || $scope.manageCtrl.game.title),
	} );

	this.onEdited = function()
	{
		Translate.growl( 'success', 'dash.games.packages.edit.saved' );
		$state.go( '^.releases' );
	};
} );
