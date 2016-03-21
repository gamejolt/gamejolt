angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuild', function( $q, $modal, Form, Api, Game_Package, Game_Release, Game_Build, Game_Build_File, Game_Build_LaunchOption, Growls, gettextCatalog, $timeout )
{
	var form = new Form( {
		model: 'Game_Build',
		template: '/app/components/forms/dashboard/game/build/build.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';
	form.scope.package = '=gjGamePackage';
	form.scope.release = '=gjGameRelease';
	form.scope._launchOptions = '=?gjGameLaunchOptions';
	form.scope.onRemoveBuild = '&gjOnRemoveBuild';
	form.scope.buildDownloadCounts = '=gjBuildDownloadCounts';
	form.scope.packageBuilds = '=gjGamePackageBuilds';  // All builds for the package.

	form.require = '^gjFormDashboardGameRelease';

	// We store all the build forms into the game release form.
	// This way when the release is saved, the builds can all be saved as well.
	var oldPost = form.link.post;
	form.link.post = function( scope, element, attrs, releaseForm )
	{
		releaseForm.buildForms[ scope.baseModel.id ] = {
			form: form,
			scope: scope,
		};

		scope.$on( '$destroy', function()
		{
			delete releaseForm.buildForms[ scope.baseModel.id ];
		} );

		// In case the Form API changes and uses a post link func.
		if ( oldPost ) {
			oldPost();
		}
	};

	form.onInit = function( scope )
	{
		scope.Game_Build = Game_Build;

		setupLaunchOptions( scope );
		setupDownloadablePlatforms( scope );
		setupStatusPolling( scope );

		if ( !scope.isLoaded ) {
			var params = [
				scope.game.id,
				scope.package.id,
				scope.release.id,
				scope.baseModel.id,
			];

			Api.sendRequest( '/web/dash/developer/games/builds/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}

		scope.remove = function()
		{
			scope.onRemoveBuild( { $build: scope.baseModel } );
		};
	};

	function setupDownloadablePlatforms( scope )
	{
		scope.platformsInfo = {
			windows: {
				icon: 'windows',
				label: gettextCatalog.getString( 'dash.games.releases.builds.windows_tag' ),
			},
			windows_64: {
				icon: 'windows',
				label: gettextCatalog.getString( 'dash.games.releases.builds.windows_64_tag' ),
			},
			mac: {
				icon: 'mac',
				label: gettextCatalog.getString( 'dash.games.releases.builds.mac_tag' ),
			},
			mac_64: {
				icon: 'mac',
				label: gettextCatalog.getString( 'dash.games.releases.builds.mac_64_tag' ),
			},
			linux: {
				icon: 'linux',
				label: gettextCatalog.getString( 'dash.games.releases.builds.linux_tag' ),
			},
			linux_64: {
				icon: 'linux',
				label: gettextCatalog.getString( 'dash.games.releases.builds.linux_64_tag' ),
			},
			other: {
				icon: 'other-os',
				label: gettextCatalog.getString( 'dash.games.releases.builds.other_tag' ),
			},
		};

		scope.platformOptions = [
			{
				key: 'windows',
				label: gettextCatalog.getString( 'dash.games.builds.form.windows_tag' ),
				icon: 'windows',
			},
			{
				key: 'windows_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.windows_64_tag' ),
				icon: 'windows',
			},
			{
				key: 'mac',
				label: gettextCatalog.getString( 'dash.games.builds.form.mac_tag' ),
				icon: 'mac',
			},
			{
				key: 'mac_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.mac_64_tag' ),
				icon: 'mac',
			},
			{
				key: 'linux',
				label: gettextCatalog.getString( 'dash.games.builds.form.linux_tag' ),
				icon: 'linux',
			},
			{
				key: 'linux_64',
				label: gettextCatalog.getString( 'dash.games.builds.form.linux_64_tag' ),
				icon: 'linux',
			},
			{
				key: 'other',
				label: gettextCatalog.getString( 'dash.games.builds.form.other_tag' ),
				icon: 'other-os',
			}
		];

		scope.isPlatformDisabled = function( platform )
		{
			// Restricted by server.
			if ( scope.restrictedPlatforms && angular.isArray( scope.restrictedPlatforms ) ) {
				if ( scope.restrictedPlatforms.indexOf( platform ) != -1 ) {
					return true;
				}
			}

			// Can only be other OR a platform.
			if ( platform != 'other' && scope.baseModel.os_other ) {
				return true;
			}
			else if (
				platform == 'other' && (
					scope.baseModel.os_windows
					|| scope.baseModel.os_mac
					|| scope.baseModel.os_linux
					|| scope.baseModel.os_windows_64
					|| scope.baseModel.os_mac_64
					|| scope.baseModel.os_linux_64
				)
			) {
				return true;
			}

			// Can't choose a platform chosen by another build in this package.
			if ( platform != 'other' ) {
				var search = {};
				search[ 'os_' + platform ] = true;
				var foundBuild = _.find( scope.packageBuilds, search );
				if ( foundBuild && foundBuild.id != scope.baseModel.id ) {
					return true;
				}
			}

			return false;
		};

		scope.platformChanged = function( platform )
		{
			scope.formState.isSettingPlatform = true;

			var val = scope.formModel[ 'os_' + platform ] ? 1 : 0;
			var params = [ scope.game.id, scope.package.id, scope.release.id, scope.baseModel.id, platform, val ];
			return Api.sendRequest( '/web/dash/developer/games/builds/set-platform/' + params.join( '/' ), {}, { detach: true } )
				.then( function( response )
				{
					scope.baseModel.assign( new Game_Build( response.gameBuild ) );

					// Copy new platforms to the form model.
					for ( var platform in scope.platformsInfo ) {
						var key = 'os_' + platform;
						scope.formModel[ key ] = scope.baseModel[ key ];
					}

					// Copy new launch options in.
					scope._launchOptions = Game_Build_LaunchOption.populate( response.launchOptions );

					scope.formState.isSettingPlatform = false;
				} )
				.catch( function()
				{
					Growls.error( 'Could not set the platform for some reason.' );
					scope.formState.isSettingPlatform = false;
				} );
		};
	}

	function setupLaunchOptions( scope )
	{
		scope.$watchCollection( '_launchOptions', function( launchOptions )
		{
			scope.launchOptions = _.where( launchOptions, { game_build_id: scope.baseModel.id } );

			launchOptions.forEach( function( launchOption )
			{
				scope.formModel[ 'launch_' + launchOption.os ] = launchOption.executable_path;
			} );
		} );

		var platformToFill;
		scope.openFileSelector = function( _platformToFill )
		{
			platformToFill = _platformToFill;

			var modalInstance = $modal.open( {
				size: 'md',
				templateUrl: '/app/components/forms/dashboard/game/build/archive-file-selector.html',
				controller: 'Forms_Dashboard_Game_Build_ArchiveFileSelectorCtrl',
				controllerAs: 'modalCtrl',
				resolve: {
					data: function()
					{
						return {
							game: scope.game,
							package: scope.package,
							release: scope.release,
							build: scope.baseModel,
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
	}

	function setupStatusPolling( scope )
	{
		scope.onBuildProcessingComplete = function( response )
		{
			// Just copy over the new build data into our current one.
			scope.baseModel.assign( response.build );
		};
	}

	return form;
} );
