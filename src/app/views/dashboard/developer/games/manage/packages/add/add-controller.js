angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.AddCtrl', function( $scope, $state, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.packages.add.page_title', { game: $scope.manageCtrl.game.title } );

	this.onPackageAdded = onPackageAdded;

	function onPackageAdded( newPackage )
	{
		$state.go( 'dashboard.developer.games.manage.packages.edit', { packageId: newPackage.id } );
	}
} );
