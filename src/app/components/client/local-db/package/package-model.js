angular.module( 'App.Client.LocalDb' )
.config( function( LocalDbProvider )
{
	LocalDbProvider.registerTable( 1, 'packages', 'id,game_id' );
} )
.factory( 'LocalDb_Package', function(
	$q, $injector, Api, LocalDb, LocalDb_Model, LocalDb_Game, Growls,
	Game_Build, Game_Package, Game_Release, Game_Build_File, Game_Build_LaunchOption )
{
	function LocalDb_Package( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		this.game_id = parseInt( this.game_id, 10 );
		this._build = new Game_Build( data.build );
	}

	LocalDb_Package._table = 'packages';

	// Will be used for install_state and update_state.
	LocalDb_Package.PATCH_PENDING = 'patch-pending';
	LocalDb_Package.DOWNLOADING = 'downloading';
	LocalDb_Package.DOWNLOAD_FAILED = 'download-failed';
	LocalDb_Package.DOWNLOADED = 'downloaded';
	LocalDb_Package.UNPACKING = 'unpacking';
	LocalDb_Package.UNPACK_FAILED = 'unpack-failed';
	LocalDb_Package.UNPACKED = 'unpacked';

	LocalDb_Package.REMOVING = 'removing';
	LocalDb_Package.REMOVE_FAILED = 'remove-failed';

	LocalDb_Package.fromPackageInfo = function( _package, release, build, launchOptions )
	{
		var packageData = _.pick( _package, [
			'id',
			'game_id',
			'title',
			'description',
		] );

		packageData.release = _.pick( release, [
			'id',
			'version_number',
		] );

		packageData.build = _.pick( build, [
			'id',
			'folder',
			'type',
			'archive_type',
			'os_windows',
			'os_windows_64',
			'os_mac',
			'os_mac_64',
			'os_linux',
			'os_linux_64',
			'os_other',
			'modified_on',
		] );

		packageData.file = _.pick( build.primary_file, [
			'id',
			'filename',
			'filesize',
		] );

		// All launch options are passed in.
		// Let's just pull the ones for our build.
		packageData.launch_options = _( launchOptions )
			.where( { game_build_id: build.id } )
			.map( function( item )
			{
				return _.pick( item, [
					'id',
					'os',
					'executable_path',
				] );
			} )
			.value();

		return new LocalDb_Package( packageData );
	};

	LocalDb_Package.createForInstall = function( _package, release, build, launchOptions )
	{
		var localPackage = LocalDb_Package.fromPackageInfo( _package, release, build, launchOptions );
		localPackage.install_state = LocalDb_Package.PATCH_PENDING;

		return localPackage;
	};

	LocalDb_Package.prototype.getDownloadUrl = function()
	{
		if ( this.install_state ) {
			return this._build.getDownloadUrl();
		}
		else if ( this.update_state ) {
			var newBuild = new Game_Build( this.update.build );
			return newBuild.getDownloadUrl();
		}
		return null;
	};

	LocalDb_Package.prototype.isSettled = function()
	{
		return !this.install_state && !this.update_state && !this.remove_state;
	};

	LocalDb_Package.prototype.isPatching = function()
	{
		return this.install_state == LocalDb_Package.PATCH_PENDING
			|| this.install_state == LocalDb_Package.DOWNLOADING
			|| this.install_state == LocalDb_Package.UNPACKING
			|| this.update_state == LocalDb_Package.PATCH_PENDING
			|| this.update_state == LocalDb_Package.DOWNLOADING
			|| this.update_state == LocalDb_Package.UNPACKING
			;
	};

	LocalDb_Package.prototype.isInstalling = function()
	{
		return this.install_state == LocalDb_Package.PATCH_PENDING
			|| this.install_state == LocalDb_Package.DOWNLOADING
			|| this.install_state == LocalDb_Package.UNPACKING
			;
	};

	LocalDb_Package.prototype.isUpdating = function()
	{
		return this.update_state == LocalDb_Package.PATCH_PENDING
			|| this.update_state == LocalDb_Package.DOWNLOADING
			|| this.update_state == LocalDb_Package.UNPACKING
			;
	};

	LocalDb_Package.prototype.isDownloading = function()
	{
		return this.install_state == LocalDb_Package.DOWNLOADING
			|| this.update_state == LocalDb_Package.DOWNLOADING
			;
	};

	LocalDb_Package.prototype.isUnpacking = function()
	{
		return this.install_state == LocalDb_Package.UNPACKING
			|| this.update_state == LocalDb_Package.UNPACKING
			;
	};

	LocalDb_Package.prototype.isPatchPaused = function()
	{
		return !!this.patch_paused;
	};

	LocalDb_Package.prototype.isPatchQueued = function()
	{
		return !!this.patch_queued;
	};

	LocalDb_Package.prototype.didInstallFail = function()
	{
		return this.install_state == LocalDb_Package.DOWNLOAD_FAILED
			|| this.install_state == LocalDb_Package.UNPACK_FAILED
			;
	};

	LocalDb_Package.prototype.didUpdateFail = function()
	{
		return this.update_state == LocalDb_Package.DOWNLOAD_FAILED
			|| this.update_state == LocalDb_Package.UNPACK_FAILED
			;
	};

	LocalDb_Package.prototype.isRunning = function()
	{
		return !!this.running_pid;
	};

	LocalDb_Package.prototype.isRemoving = function()
	{
		return this.remove_state == LocalDb_Package.REMOVING;
	};

	LocalDb_Package.prototype.$setInstallDir = function( dir )
	{
		this.install_dir = dir;
		return this.$save();
	};

	LocalDb_Package.prototype.$setInstallState = function( state )
	{
		this.install_state = state;
		return this.$save();
	};

	LocalDb_Package.prototype.$setPatchPaused = function()
	{
		this.patch_paused = true;
		return this.$save();
	};

	LocalDb_Package.prototype.$setPatchResumed = function()
	{
		this.patch_paused = false;
		return this.$save();
	};

	LocalDb_Package.prototype.$setPatchQueued = function()
	{
		this.patch_queued = true;
		return this.$save();
	};

	LocalDb_Package.prototype.$setPatchUnqueued = function()
	{
		this.patch_queued = false;
		return this.$save();
	};

	LocalDb_Package.prototype.$setInstalled = function()
	{
		// Remove any stuff only needed while installing.
		delete this.install_state;
		delete this.download_progress;
		delete this.unpack_progress;
		delete this.patch_paused;
		delete this.patch_queued;

		return this.$save();
	};

	LocalDb_Package.prototype.$setUpdateState = function( state )
	{
		this.update_state = state;
		return this.$save();
	};

	LocalDb_Package.prototype.$setUpdated = function()
	{
		// Copy the new package into this one.
		this.assign( this.update );

		// Remove any stuff only needed while updating.
		delete this.update;
		delete this.update_state;
		delete this.download_progress;
		delete this.unpack_progress;
		delete this.patch_paused;
		delete this.patch_queued;

		return this.$save();
	};

	LocalDb_Package.prototype.$setRunningPid = function( pid )
	{
		this.running_pid = pid;
		return this.$save();
	};

	LocalDb_Package.prototype.$clearRunningPid = function()
	{
		delete this.running_pid;
		return this.$save();
	};

	LocalDb_Package.prototype.$setRemoveState = function( state )
	{
		this.remove_state = state;
		return this.$save();
	};

	LocalDb_Package.prototype.$startUpdate = function( newBuildId )
	{
		var _this = this;

		// If this package isn't installed (and at rest), we don't update.
		if ( !this.isSettled() ) {
			return $q.resolve( false );
		}

		return Api.sendRequest( '/web/client/get-build-for-update/' + newBuildId, null, { detach: true } )
			.then( function( response )
			{
				if ( !response.package ) {
					return $q.resolve( false );
				}

				_this.update = LocalDb_Package.fromPackageInfo( response.package, response.release, response.build, response.launchOptions );
				_this.update_state = LocalDb_Package.PATCH_PENDING;

				return _this.$save()
					.then( function()
					{
						var game = $injector.get( 'Client_Library' ).games[ _this.game_id ];
						$injector.get( 'Client_Installer' ).install( game, _this );
					} );
			} );
	};

	LocalDb_Package.prototype.$uninstall = function( noNotify )
	{
		var _this = this;
		var game;

		return LocalDb_Game.fetch( _this.game_id )
			.then( function( _game )
			{
				game = _game;

				// Make sure we're clean.
				delete _this.install_state;
				delete _this.download_progress;
				delete _this.unpack_progress;
				delete _this.patch_paused;
				delete _this.patch_queued;

				return _this.$setRemoveState( LocalDb_Package.REMOVING );
			} )
			.then( function()
			{
				return $injector.get( 'Client_Library' ).removePackage( _this );
			} )
			.then( function()
			{
				return LocalDb.transaction( 'rw', [ LocalDb_Game, LocalDb_Package ], function()
				{
					// Get the number of packages in this game.
					return LocalDb_Package.table().where( 'game_id' ).equals( _this.game_id ).count()
						.then( function( count )
						{
							// Note that some times a game is removed before the package (really weird cases).
							// We still want the remove to go through, so be sure to skip this situation.
							if ( !game ) {
								return;
							}

							// If this is the last package for the game, remove the game since we no longer need it.
							if ( count <= 1 ) {
								return game.$remove();
							}
						} )
						.then( function()
						{
							_this.$remove();
						} );
				} );
			} )
			.then( function()
			{
				if ( !noNotify ) {
					Growls.success( 'Removed ' + (_this.title || game.title || 'the package') + ' from your computer.', 'Package Removed' );
				}
			} )
			.catch( function( err )
			{
				console.error( err );
				if ( !noNotify ) {
					Growls.error( 'Could not remove ' + (_this.title || game.title || 'the package') + '.', 'Remove Failed' );
				}
				_this.$setRemoveState( LocalDb_Package.REMOVE_FAILED );
			} );
	};

	return LocalDb_Model.create( LocalDb_Package );
} );
