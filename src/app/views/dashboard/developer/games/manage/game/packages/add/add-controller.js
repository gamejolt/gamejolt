angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Developer.Games.Manage.Game.Packages.AddCtrl', function( $scope, $state, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.packages.add.page_title', { game: $scope.manageCtrl.game.title } );

	this.onPackageAdded = onPackageAdded;

	function onPackageAdded( newPackage )
	{
		$state.go( 'dashboard.developer.games.manage.game.packages.edit', { packageId: newPackage.id } );
	}
} );
