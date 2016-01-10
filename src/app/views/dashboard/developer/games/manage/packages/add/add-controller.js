angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.AddCtrl', function( $scope, $state, Translate )
{
	Translate.pageTitle( 'dash.games.packages.add.page_title', { game: $scope.manageCtrl.game.title } );

	this.onPackageAdded = onPackageAdded;

	function onPackageAdded( newPackage )
	{
		$scope.packagesCtrl.packages.push( newPackage );
		$state.go( 'dashboard.developer.games.manage.packages.package.releases', { packageId: newPackage.id } );
	}
} );
