var GamePackagePayloadModel = require( '../../../../lib/gj-lib-client/components/game/package/package-payload.model' ).GamePackagePayloadModel;

angular.module( 'App.Client.InstallPackageModal' ).controller( 'Client_InstallPackageModalCtrl', function(
	$scope, $modalInstance, Api, Device, Client_Library, Game, Game_Package, game )
{
	var _this = this;

	this.game = game;
	this.isLoading = true;

	Api.sendRequest( '/web/discover/games/packages/' + game.id )
		.then( function( payload )
		{
			var packageData = new GamePackagePayloadModel( payload );
			angular.extend( _this, packageData );

			var os = Device.os();
			var arch = Device.arch();

			_this.isLoading = false;
			_this.installableBuilds = Game.pluckInstallableBuilds( _this.packages, os, arch );
			_this.buildsByPackage = _.indexBy( _this.installableBuilds, 'game_package_id' );
		} );

	this.install = function( _package )
	{
		var build = this.buildsByPackage[ _package.id ];
		Client_Library.installPackage(
			this.game,
			build._package,
			build._release,
			build,
			build._launch_options
		);

		// TODO: Go to installed games and scroll to the installing game.
		$modalInstance.dismiss();
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
