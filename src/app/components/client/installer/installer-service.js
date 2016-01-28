angular.module( 'App.Client.Installer' )
.run( function( $rootScope, Client_Installer )
{
	$rootScope.$on( 'Client_Library.watchersSet', function()
	{
		Client_Installer.init();
	} );
} )
.service( 'Client_Installer', function( $q, $rootScope, Client, Client_Library, Settings, LocalDb, LocalDb_Package, Growls )
{
	var _this = this;

	this.currentlyPatching = {};
	this.numPatching = 0;

	this.init = function()
	{
		// Make sure we pull in the queue settings.
		this.checkQueueSettings();

		// This will retry to install anything that was installing before client was closed.
		angular.forEach( Client_Library.packages, function( localPackage )
		{
			if ( localPackage.isPatching() && !localPackage.isPatchPaused() ) {
				_this.retryInstall( localPackage );
			}
		} );

		// We set the system progress bar as we patch.
		// Should be the accumulation of all current patches ongoing.
		$rootScope.$watch( function()
		{
			if ( !_this.numPatching ) {
				return null;
			}

			var currentProgress = 0;
			angular.forEach( _this.currentlyPatching, function( handle, packageId )
			{
				currentProgress += _this.getPackagePatchProgress( packageId ) || 0;
			} );
			return currentProgress / _this.numPatching;
		},
		function( progress )
		{
			if ( progress === null ) {
				Client.clearProgressBar();
				return;
			}

			Client.setProgressBar( progress );
		} );
	};

	this.getPackagePatchProgress = function( packageId )
	{
		if ( Client_Library.packages[ packageId ].download_progress ) {
			return Client_Library.packages[ packageId ].download_progress.progress;
		}
		else if ( Client_Library.packages[ packageId ].unpack_progress ) {
			return Client_Library.packages[ packageId ].unpack_progress.progress;
		}
		return null;
	};

	this.checkQueueSettings = function()
	{
		var Queue = require( 'client-voodoo' ).VoodooQueue;

		Queue.faster = {
			downloads: Settings.get( 'max-download-count' ),
			extractions: Settings.get( 'max-extract-count' ),
		};

		if ( Settings.get( 'queue-when-playing' ) ) {
			Queue.slower = {
				downloads: 0,
				extractions: 0,
			};
		}
		else {
			Queue.slower = Queue.faster;
		}
	};

	this.retryInstall = function( localPackage )
	{
		// Reset states.
		var downloadStates = [
			LocalDb_Package.DOWNLOADING,
			LocalDb_Package.DOWNLOAD_FAILED,
		];

		var unpackStates = [
			LocalDb_Package.UNPACKING,
			LocalDb_Package.UNPACK_FAILED,
		];

		var promise = $q.resolve();
		if ( downloadStates.indexOf( localPackage.install_state ) != -1 ) {
			promise = localPackage.$setInstallState( LocalDb_Package.PATCH_PENDING );
		}
		else if ( unpackStates.indexOf( localPackage.install_state ) != -1 ) {
			promise = localPackage.$setInstallState( LocalDb_Package.DOWNLOADED );
		}
		else if ( downloadStates.indexOf( localPackage.update_state ) != -1 ) {
			promise = localPackage.$setUpdateState( LocalDb_Package.PATCH_PENDING );
		}
		else if ( unpackStates.indexOf( localPackage.update_state ) != -1 ) {
			promise = localPackage.$setUpdateState( LocalDb_Package.DOWNLOADED );
		}

		return promise.then( function()
		{
			var game = Client_Library.games[ localPackage.game_id ];
			_this.install( game, localPackage );
		} );
	};

	this.install = function( game, localPackage )
	{
		var promise = $q.resolve();

		// We freeze the installation directory in time.
		if ( !localPackage.install_dir ) {
			var path = require( 'path' );
			promise = promise.then( function()
			{
				return localPackage.$setInstallDir( path.join(
					Settings.get( 'game-install-dir' ),
					game.slug + '-' + game.id,
					(localPackage.name || 'default') + '-' + localPackage.id
				) );
			} );
		}

		// If we were paused before, let's resume.
		// This happens if they paused, then restarted client. The patch would still be paused
		// but if they click resume we want to start a new install again.
		if ( localPackage.isPatchPaused() ) {
			promise = promise.then( function()
			{
				return localPackage.$setPatchResumed();
			} );
		}

		function getDownloadUrl()
		{
			return localPackage.getDownloadUrl()
				.then( function( response )
				{
					return response.downloadUrl;
				} );
		}

		var operation = localPackage.install_state ? 'install' : 'update';
		var packageTitle = (localPackage.title || game.title);
		if ( packageTitle != game.title ) {
			packageTitle += ' for ' + game.title;
		}

		var patchHandle = null;
		return promise
			.then( function()
			{
				var Patcher = require( 'client-voodoo' ).Patcher;

				patchHandle = Patcher.patch( getDownloadUrl, localPackage );

				patchHandle
					.onDownloading( function()
					{
						$rootScope.$apply( function()
						{
							if ( localPackage.install_state ) {
								localPackage.$setInstallState( LocalDb_Package.DOWNLOADING );
							}
							else if ( localPackage.update_state ) {
								localPackage.$setUpdateState( LocalDb_Package.DOWNLOADING );
							}
						} );
					} )
					.onProgress( 1, function( progress )
					{
						$rootScope.$apply( function()
						{
							localPackage.download_progress = progress;
							localPackage.$save();
						} );
					} )
					.onPatching( function()
					{
						$rootScope.$apply( function()
						{
							// No longer needed.
							delete localPackage.download_progress;

							if ( localPackage.install_state ) {
								localPackage.$setInstallState( LocalDb_Package.UNPACKING );
							}
							else if ( localPackage.update_state ) {
								localPackage.$setUpdateState( LocalDb_Package.UNPACKING );
							}
						} );
					} )
					.onExtractProgress( 1, function( progress )
					{
						$rootScope.$apply( function()
						{
							localPackage.unpack_progress = progress;
							localPackage.$save();
						} );
					} )
					.onPaused( function( wasQueued )
					{
						$rootScope.$apply( function()
						{
							if ( wasQueued ) {
								localPackage.$setPatchQueued();
							}
							else {
								localPackage.$setPatchPaused()
							}
						} );
					} )
					.onResumed( function( wasInQueue )
					{
						$rootScope.$apply( function()
						{
							if ( wasInQueue ) {
								localPackage.$setPatchUnqueued();
							}
							else {
								localPackage.$setPatchResumed()
							}
						} );
					} )
					.start();

				_this._startPatching( localPackage, patchHandle );

				return $q.when( patchHandle.promise );
			} )
			.then( function()
			{
				_this._stopPatching( localPackage );

				if ( localPackage.install_state ) {
					return localPackage.$setInstalled();
				}
				else if ( localPackage.update_state ) {
					return localPackage.$setUpdated();
				}
			} )
			.then( function()
			{
				var action = operation == 'install' ? 'finished installing' : 'updated to the latest version';
				var title = operation == 'install' ? 'Game Installed' : 'Game Updated';
				Growls.add( 'success', packageTitle + ' has ' + action + '.', title );
			} )
			.catch( function( err )
			{
				console.error( err );

				var action = operation == 'install' ? 'install' : 'update';
				var title = operation == 'install' ? 'Installation Failed' : 'Update Failed';
				Growls.add( 'error', packageTitle + ' failed to ' + action + '.', title );

				if ( localPackage.install_state == LocalDb_Package.DOWNLOADING ) {
					localPackage.$setInstallState( LocalDb_Package.DOWNLOAD_FAILED );
				}
				else if ( localPackage.install_state == LocalDb_Package.UNPACKING ) {
					localPackage.$setInstallState( LocalDb_Package.UNPACK_FAILED );
				}
				else if ( localPackage.update_state == LocalDb_Package.DOWNLOADING ) {
					localPackage.$setUpdateState( LocalDb_Package.DOWNLOAD_FAILED );
				}
				else if ( localPackage.update_state == LocalDb_Package.UNPACKING ) {
					localPackage.$setUpdateState( LocalDb_Package.UNPACK_FAILED );
				}

				_this._stopPatching( localPackage );
			} );
	};

	this._startPatching = function( localPackage, patchHandle )
	{
		if ( !this.currentlyPatching[ localPackage.id ] ) {
			this.currentlyPatching[ localPackage.id ] = patchHandle;
			++this.numPatching;
		}
	};

	this._stopPatching = function( localPackage )
	{
		if ( this.currentlyPatching[ localPackage.id ] ) {
			delete this.currentlyPatching[ localPackage.id ];
			--this.numPatching;
		}
	};

	this.pause = function( localPackage )
	{
		var patchHandle = _this.currentlyPatching[ localPackage.id ];
		if ( !patchHandle ) {
			throw new Error( 'Package is not installing.' );
		}

		return patchHandle.stop();
	};

	this.resume = function( localPackage )
	{
		var patchHandle = _this.currentlyPatching[ localPackage.id ];

		if ( !patchHandle ) {
			return this.retryInstall( localPackage );
		}

		return patchHandle.start();
	};

	this.cancel = function( localPackage )
	{
		return $q( function( resolve, reject )
		{
			var patchHandle = _this.currentlyPatching[ localPackage.id ];
			if ( patchHandle ) {

				// This is absurd, ylivay.
				patchHandle.onCanceled( function()
				{
					_this._stopPatching( localPackage );
					resolve();
				} );

				patchHandle.cancel();
			}
			else {
				resolve();
			}
		} );
	};
} );
