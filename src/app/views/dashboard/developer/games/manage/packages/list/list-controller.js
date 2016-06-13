angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.ListCtrl', function(
	$scope, $state, App, Game_Package, Sellable, ModalConfirm, Growls, gettextCatalog, packagesPayload )
{
	var _this = this;
	var manageCtrl = $scope.manageCtrl;

	$scope.Game_Package = Game_Package;

	App.title = gettextCatalog.getString( 'Manage Packages for {{ game }}', { game: manageCtrl.game.title } );

	this.packages = Game_Package.populate( packagesPayload.packages );
	this.sellables = _.indexBy( Sellable.populate( packagesPayload.sellables ), 'game_package_id' );

	this.isPackageActive = isPackageActive;
	this.onPackagesSorted = onPackagesSorted;
	this.removePackage = removePackage;

	updatePackagesSort();

	function isPackageActive( _package )
	{
		return $state.includes( 'dashboard.developer.games.manage.packages.edit', { id: manageCtrl.game.id, packageId: _package.id } )
			|| $state.includes( 'dashboard.developer.games.manage.packages.release', { id: manageCtrl.game.id, packageId: _package.id } );
	}

	function updatePackagesSort()
	{
		_this.packagesSort = _.pluck( this.packages, 'id' );
	}

	function onPackagesSorted( event )
	{
		var newPackagesSort = _.pluck( _this.packages, 'id' );

		if ( !angular.equals( newPackagesSort, _this.packagesSort ) ) {
			_this.packagesSort = newPackagesSort;
			Game_Package.$saveSort( manageCtrl.game.id, _this.packagesSort );
		}
	}

	function removePackage( package )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.packages.manage.remove_confirmation' ) )
			.then( function()
			{
				return package.$remove();
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.packages.manage.removed_growl' ),
					gettextCatalog.getString( 'dash.games.packages.manage.removed_growl_title' )
				);

				// We have to do a refresh since a new package may have been chosen as the primary sellable.
				$state.reload( $state.current );
			} );
	}
} );
