angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.PackageCtrl', function(
	$scope, $state, $translate, Translate, Game_Package, Game_Release, ModalConfirm, Growls, packagePayload )
{
	$scope.Game_Release = Game_Release;

	// We update the global packages list.
	// This ensures as we edit the package, things stay updated.
	this.package = _.find( $scope.packagesCtrl.packages, { id: packagePayload.package.id } );
	this.package.assign( packagePayload.package );

	this.releases = Game_Release.populate( packagePayload.releases );

	this.removePackage = removePackage;

	function removePackage()
	{
		var _this = this;
		ModalConfirm.show( $translate.instant( 'dash.games.packages.manage.remove_confirmation' ) )
			.then( function()
			{
				return _this.package.$remove();
			} )
			.then( function()
			{
				_.remove( $scope.packagesCtrl.packages, { id: _this.package.id } );
				Translate.growl( 'success', 'dash.games.packages.manage.removed' );
				$state.go( 'dashboard.developer.games.manage.packages' );
			} );
	}
} );
