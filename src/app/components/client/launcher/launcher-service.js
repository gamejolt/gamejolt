angular.module( 'App.Client.Launcher' )
.run( function( $rootScope, Client_Launcher )
{
	$rootScope.$on( 'Client_Library.watchersSet', function()
	{
		Client_Launcher.init();
	} );
} )
.service( 'Client_Launcher', function( $q, $rootScope, Client_Library, Api, Device, Growls )
{
	var _this = this;

	this.currentlyPlaying = [];

	this.init = function()
	{
		var gui = require( 'nw.gui' );
		var Application = require( 'client-voodoo' ).Application;
		var path = require( 'path' );
		var pidDir = path.resolve( gui.App.dataPath, 'game-pids' );
		Application.setPidDir( pidDir );

		$q.when( Application.ensurePidDir() )
			.then( function()
			{
				// Get all running packages by looking at the game pid directory.
				var runningPackageIds = require( 'fs' ).readdirSync( pidDir ).map( function( filename )
				{
					// Pid files are named after the package ids they are currently running.
					try {
						return parseInt( path.basename( filename ) );
					}
					catch ( err ) {
						return false;
					}
				} ).filter( function( packageId ) { return !!packageId } );

				// Reattach all running games after a restart.
				_.forEach( Client_Library.packages, function( localPackage )
				{
					if ( runningPackageIds.indexOf( localPackage.id ) !== -1 || localPackage.isRunning() ) {
						localPackage.$setRunningPid( {
							wrapperId: localPackage.id.toString(),
						} );
						_this.reattach( localPackage );
					}
				} );
			} );
	};

	this.launch = function( localPackage )
	{
		var Launcher = require( 'client-voodoo' ).Launcher;
		var os = Device.os();
		var arch = Device.arch();

		return $q.when( Api.sendRequest( '/web/dash/token/get_for_game', { game_id: localPackage.game_id } ) )
			.then( function( credentials )
			{
				credentials = { username: credentials.username, user_token: credentials.token };
				return Launcher.launch( localPackage, os, arch, credentials ).promise;
			} )
			.then( function( launchInstance )
			{
				return _this.attach( localPackage, launchInstance );
			} )
			.catch( function( e )
			{
				_this.clear( localPackage );
				console.error( e );
				Growls.error( 'Could not launch game.' );
			} );
	};

	this.reattach = function( localPackage )
	{
		var Launcher = require( 'client-voodoo' ).Launcher;

		return $q.when( Launcher.attach( localPackage.running_pid ) )
			.then( function( launchInstance )
			{
				return _this.attach( localPackage, launchInstance );
			} )
			.catch( function()
			{
				_this.clear( localPackage );
			} );
	};

	this.attach = function( localPackage, launchInstance )
	{
		this.currentlyPlaying.push( localPackage );

		launchInstance.on( 'end', function()
		{
			_this.clear( localPackage );
		} );

		$rootScope.$emit( 'Client_Launcher.gameLaunched', this.currentlyPlaying.length );

		return localPackage.$setRunningPid( launchInstance.pid );
	};

	this.clear = function( localPackage )
	{
		var removedItems = _.remove( this.currentlyPlaying, { id: localPackage.id } );
		localPackage.$clearRunningPid();
		if ( removedItems.length ) {
			$rootScope.$emit( 'Client_Launcher.gameClosed', this.currentlyPlaying.length );
		}
	};
} );
