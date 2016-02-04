angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuildLaunchOptions', function( $modal, $q, Api, Form, Game_Build_LaunchOption, gettextCatalog )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/game/build/launch-options/launch-options.html',
	} );

	form.scope.game = '=gjGame';
	form.scope.package = '=gjGamePackage';
	form.scope.release = '=gjGameRelease';
	form.scope.build = '=gjGameBuild';
	form.scope.launchOptions = '=?gjGameBuildLaunchOptions';

	form.onInit = function( scope )
	{
		scope.platformOptions = [
			{
				key: 'windows',
				label: gettextCatalog.getString( 'dash.games.builds.form.windows_tag' ),
			},
			{
				key: 'windows_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.windows_64_tag' ),
			},
			{
				key: 'mac',
				label: gettextCatalog.getString( 'dash.games.builds.form.mac_tag' ),
			},
			{
				key: 'mac_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.mac_64_tag' ),
			},
			{
				key: 'linux',
				label: gettextCatalog.getString( 'dash.games.builds.form.linux_tag' ),
			},
			{
				key: 'linux_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.linux_64_tag' ),
			},
			{
				key: 'other',
				label: gettextCatalog.getString( 'dash.games.builds.form.other_tag' ),
			}
		];

		if ( scope.launchOptions && scope.launchOptions.length ) {
			if ( scope.launchOptions.length == 1 && !scope.launchOptions[0].executable_path ) {
				scope.formModel.is_standalone = true;
			}
			else {
				scope.formModel.is_standalone = false;
				scope.launchOptions.forEach( function( launchOption )
				{
					scope.formModel[ launchOption.os ] = launchOption.executable_path;
				} );
			}
		}
		else {
			scope.formModel.is_standalone = true;
		}

		var platformToFill;
		scope.openFileSelector = function( _platformToFill )
		{
			platformToFill = _platformToFill;

			var modalInstance = $modal.open( {
				size: 'md',
				templateUrl: '/app/components/forms/dashboard/game/build/launch-options/archive-file-selector.html',
				controller: 'Forms_Dashboard_Game_Build_LaunchOptions_ArchiveFileSelectorCtrl',
				controllerAs: 'modalCtrl',
				resolve: {
					data: function()
					{
						return {
							game: scope.game,
							package: scope.package,
							release: scope.release,
							build: scope.build,
							platform: platformToFill,
						};
					},
				}
			} );

			modalInstance.result.then( function( selected )
			{
				scope.formModel[ platformToFill ] = selected;
				platformToFill = null;
			} );
		};
	};

	form.onSubmit = function( scope )
	{
		var params = [ scope.game.id, scope.package.id, scope.release.id, scope.build.id ];
		return Api.sendRequest( '/web/dash/developer/games/builds/launch-options/set/' + params.join( '/' ), scope.formModel ).then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}
			return response;
		} );
	};

	return form;
} );
