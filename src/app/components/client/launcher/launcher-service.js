angular.module( 'App.Client.Launcher' )
.run( function( $rootScope, Client_Launcher )
{
	$rootScope.$on( 'Client_Library.watchersSet', function()
	{
		Client_Launcher.init();
	} );
} )
.service( 'Client_Launcher', function( $q, $rootScope, Client_Library, Device, Growls )
{
	var _this = this;

	this.currentlyPlaying = [];

	this.init = function()
	{
		// Reattach all running games after a restart.
		_.forEach( Client_Library.packages, function( localPackage )
		{
			if ( localPackage.isRunning() ) {
				_this.reattach( localPackage );
			}
		} );
	};

	this.launch = function( localPackage )
	{
		var Launcher = require( 'client-voodoo' ).Launcher;
		var os = Device.os();
		var arch = Device.arch();

		return $q.when( Launcher.launch( localPackage, os, arch ).promise )
			.then( function( launchInstance )
			{
				return _this.attach( localPackage, launchInstance );
			} )
			.catch( function( e )
			{
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
				// It's no longer running.
				if ( !launchInstance ) {
					_this.gameClosed( localPackage );
					return;
				}

				return _this.attach( localPackage, launchInstance );
			} );
	};

	this.attach = function( localPackage, launchInstance )
	{
		this.currentlyPlaying.push( localPackage );

		launchInstance.on( 'end', function()
		{
			_this.gameClosed( localPackage );
		} );

		$rootScope.$emit( 'Client_Launcher.gameLaunched', this.currentlyPlaying.length );

		return localPackage.$setRunningPid( launchInstance.pid );
	};

	this.gameClosed = function( localPackage )
	{
		localPackage.$clearRunningPid();
		_.remove( this.currentlyPlaying, { id: localPackage.id } );
		$rootScope.$emit( 'Client_Launcher.gameClosed', this.currentlyPlaying.length );
	};
} );
