angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Package.EditCtrl', function( $scope, $state, App, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.packages.edit.page_title', {
		game: $scope.manageCtrl.game.title,
		package: ($scope.packageCtrl.package.title || $scope.manageCtrl.game.title),
	} );

	this.onEdited = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.packages.edit.saved_growl' ),
			gettextCatalog.getString( 'dash.games.packages.edit.saved_growl_title' )
		);
		$state.go( '^.releases' );
	};
} );
