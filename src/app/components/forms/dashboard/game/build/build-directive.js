angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuild', function( $q, $translate, Form, Api, Game_Package, Game_Release, Game_Build, Game_Build_File )
{
	var form = new Form( {
		model: 'Game_Build',
		template: '/app/components/forms/dashboard/game/build/build.html',
	} );

	form.scope.game = '=gjGame';
	form.scope.package = '=gjGamePackage';
	form.scope.release = '=?gjGameRelease';

	form.onInit = function( scope )
	{
		// Set the game ID on the form model from the game passed in.
		scope.formModel.game_id = scope.game.id;
		scope.formModel.game_package_id = scope.package.id;
		scope.formModel.game_release_id = scope.release.id;

		if ( !scope.isLoaded ) {
			var params = [
				scope.formModel.game_id,
				scope.formModel.game_package_id,
				scope.formModel.game_release_id
			];

			// If we're editing, pass in the build ID as well.
			if ( scope.baseModel ) {
				params.push( scope.baseModel.id );
			}

			Api.sendRequest( '/web/dash/developer/games/builds/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}

		scope.formState.werePlatformsTouched = false;

		scope.platformOptions = [
			{
				key: 'windows',
				label: $translate.instant( 'dash.games.builds.form.windows_tag' ),
				icon: 'windows',
			},
			{
				key: 'windows_64',
				label: $translate.instant( 'dash.games.builds.form.windows_64_tag' ),
				icon: 'windows',
			},
			{
				key: 'mac',
				label: $translate.instant( 'dash.games.builds.form.mac_tag' ),
				icon: 'mac',
			},
			{
				key: 'mac_64',
				label: $translate.instant( 'dash.games.builds.form.mac_64_tag' ),
				icon: 'mac',
			},
			{
				key: 'linux',
				label: $translate.instant( 'dash.games.builds.form.linux_tag' ),
				icon: 'linux',
			},
			{
				key: 'linux_64',
				label: $translate.instant( 'dash.games.builds.form.linux_64_tag' ),
				icon: 'linux',
			},
			{
				key: 'other',
				label: $translate.instant( 'dash.games.builds.form.other_tag' ),
				icon: 'other-os',
			}
		];

		scope.platformOptionsChunked = _.chunk( scope.platformOptions, 2 );

		if ( scope.method == 'add' ) {
			scope.formModel.type = Game_Build.TYPE_DOWNLOADABLE;
			scope.formModel.arch = Game_Build.ARCH_32BIT;
			scope.tab = 'downloadable';

			scope.changeTab = function( tab )
			{
				scope.tab = tab;
				if ( tab == 'downloadable' ) {
					scope.formModel.type = Game_Build.TYPE_DOWNLOADABLE;
				}
				else {
					scope.formModel.type = Game_Build.TYPE_HTML;
				}
			};

			scope.getUploadAccept = function()
			{
				if ( scope.formModel.type == Game_Build.TYPE_HTML ) {
					return '.zip';
				}
				else if ( scope.formModel.type == Game_Build.TYPE_FLASH ) {
					return '.swf';
				}
				else if ( scope.formModel.type == Game_Build.TYPE_UNITY ) {
					return '.unity3d';
				}
				else if ( scope.formModel.type == Game_Build.TYPE_SILVERLIGHT ) {
					return '.xap';
				}
				else if ( scope.formModel.type == Game_Build.TYPE_APPLET ) {
					return '.jar';
				}

				return undefined;
			};
		}

		scope.isPlatformDisabled = function( platform )
		{
			if ( platform != 'other' && scope.formModel.os_other ) {
				return true;
			}
			else if (
				platform == 'other' && (
					scope.formModel.os_windows
					|| scope.formModel.os_mac
					|| scope.formModel.os_linux
					|| scope.formModel.os_windows_64
					|| scope.formModel.os_mac_64
					|| scope.formModel.os_linux_64
				)
			) {
				return true;
			}

			if ( scope.reservedPlatforms.indexOf( platform ) !== -1 ) {
				return true;
			}

			return false;
		};

		scope.checkPlatformChecked = function()
		{
			if ( scope.formModel.type != Game_Build.TYPE_DOWNLOADABLE ) {
				return true;
			}

			return scope.formModel.os_windows
				|| scope.formModel.os_mac
				|| scope.formModel.os_linux
				|| scope.formModel.os_windows_64
				|| scope.formModel.os_mac_64
				|| scope.formModel.os_linux_64
				|| scope.formModel.os_other
				;
		};
	};

	return form;
} );
