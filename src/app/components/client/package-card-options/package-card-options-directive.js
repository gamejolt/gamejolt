angular.module( 'App.Client.PackageCardOptions' ).directive( 'gjClientPackageCardOptions', function()
{
	return {
		restrict: 'E',
		require: '^gjGamePackageCard',
		scope: true,
		templateUrl: '/app/components/client/package-card-options/package-card-options.html',
		controller: function( $scope, Device, Analytics, Client_Library, Client_Installer, Client_Launcher, LocalDb_Package, Game, Game_Build, Popover )
		{
			// Parent scope controller.
			var ctrl = $scope.ctrl;

			// Needed for constants on parent.
			ctrl.LocalDb_Package = LocalDb_Package;

			$scope.Client_Library = Client_Library;
			$scope.LocalDb_Package = LocalDb_Package;

			var build;
			var arch = Device.arch();
			var os = Device.os();

			ctrl.canInstall = ctrl.downloadableBuild ? Game.checkDeviceSupport( ctrl.downloadableBuild, os, arch ) : false;

			// We want to put the installable build in extra builds as well.
			// This way they can also download it if they don't want to install.
			if ( ctrl.downloadableBuild ) {
				build = ctrl.downloadableBuild;

				// Gotta use the showcased OS for this since it's the OS that this build fulfilled.
				ctrl.extraBuilds.unshift( {
					type: build.type,
					icon: ctrl.supportInfo[ ctrl.showcasedOs ].icon,
					build: build,
					arch: ctrl.supportInfo[ ctrl.showcasedOs ].arch,
				} );
			}

			// If the browser build isn't an HTML/ROM build, then it can't be
			// quick played in their client.
			if ( ctrl.browserBuild && ctrl.browserBuild.type != Game_Build.TYPE_HTML && ctrl.browserBuild.type != Game_Build.TYPE_ROM ) {
				build = ctrl.browserBuild;
				ctrl.extraBuilds.unshift( {
					type: build.type,
					icon: ctrl.supportInfo[ build.type ].icon,
					build: build,
				} );

				// Clear out the browser build since it's not quick playable.
				ctrl.browserBuild = null;
			}

			// If we can't install the downloadable build, then we need to show a message.
			if ( ctrl.downloadableBuild && !ctrl.canInstall ) {

				// If there is a quick play web build, then we show a different msg.
				if ( ctrl.browserBuild ) {
					ctrl.downloadableUnsupportedHasQuickPlay = true;
				}
				else {
					ctrl.downloadableUnsupported = true;
				}
			}

			// We watch their library to see if this package is installed.
			$scope.$watch( 'Client_Library.packages[ ctrl.package.id ]', function( localPackage )
			{
				ctrl.localPackage = localPackage;
			} );

			ctrl.startInstall = function( build )
			{
				Analytics.trackEvent( 'game-package-card', 'install' );

				Client_Library.installPackage(
					ctrl.game,
					build._package,
					build._release,
					build,
					build._launch_options
				);
			};

			ctrl.pauseInstall = function()
			{
				Analytics.trackEvent( 'game-package-card', 'pause-install' );
				Client_Installer.pause( ctrl.localPackage );
			};

			ctrl.resumeInstall = function()
			{
				Analytics.trackEvent( 'game-package-card', 'resume-install' );
				Client_Installer.resume( ctrl.localPackage );
			};

			ctrl.cancelInstall = function()
			{
				Analytics.trackEvent( 'game-package-card', 'cancel-install' );
				ctrl.localPackage.$uninstall();
			};

			ctrl.retryInstall = function()
			{
				Analytics.trackEvent( 'game-package-card', 'retry-install' );
				Client_Installer.retryInstall( ctrl.localPackage );
			};

			ctrl.launchPackage = function()
			{
				Analytics.trackEvent( 'game-package-card', 'launch' );
				Client_Launcher.launch( ctrl.localPackage );
			};

			ctrl.uninstall = function()
			{
				// Can't if the package is running.
				if ( ctrl.localPackage.isRunning() ) {
					return;
				}

				Analytics.trackEvent( 'game-package-card', 'uninstall' );
				ctrl.localPackage.$uninstall();
				Popover.hideAll();
			};
		}
	};
} );
