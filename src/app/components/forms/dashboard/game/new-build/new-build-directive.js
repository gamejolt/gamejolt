angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameNewBuild', function( $q, Form, Api, Game_Package, Game_Release, Game_Build, Game_Build_File, gettextCatalog )
{
	var form = new Form( {
		model: 'Game_Build',
		template: '/app/components/forms/dashboard/game/new-build/new-build.html',
		resetOnSubmit: true,
	} );

	form.scope.type = '@gjBuildType';
	form.scope.game = '=gjGame';
	form.scope.package = '=gjGamePackage';
	form.scope.release = '=gjGameRelease';
	form.scope.packageBuilds = '=gjGamePackageBuilds';  // All builds for the package.

	form.onInit = function( scope )
	{
		// Set the game ID on the form model from the game passed in.
		scope.formModel.type = scope.type;
		scope.formModel.game_id = scope.game.id;
		scope.formModel.game_package_id = scope.package.id;
		scope.formModel.game_release_id = scope.release.id;

		if ( !scope.isLoaded ) {
			var params = [
				scope.formModel.game_id,
				scope.formModel.game_package_id,
				scope.formModel.game_release_id
			];

			Api.sendRequest( '/web/dash/developer/games/builds/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );

				// ROM types can change, so we pull from server.
				if ( payload.romTypes ) {
					for ( var i = 0; i < payload.romTypes.length; ++i ) {
						var ext = payload.romTypes[ i ];
						browserTypes[ ext ] = Game_Build.TYPE_ROM;
					}
				}
			} );
		}

		var browserTypes = {
			'.zip': Game_Build.TYPE_HTML,
			'.swf': Game_Build.TYPE_FLASH,
			'.unity3d': Game_Build.TYPE_UNITY,
		};

		scope.getUploadAccept = function()
		{
			if ( scope.type == 'browser' ) {
				var validTypes = [];
				for ( ext in browserTypes ) {
					if ( !_.find( scope.packageBuilds, { type: browserTypes[ ext ] } ) ) {
						validTypes.push( ext );
					}
				}

				return validTypes.join( ',' );
			}

			return undefined;
		};
	};

	return form;
} );
