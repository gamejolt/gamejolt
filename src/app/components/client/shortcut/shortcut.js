angular.module( 'App.Client.Shortcut', [] ).run( function( Environment, Device )
{
	// We just make ".desktop" entries for linux at the moment.
	// This way it's easier to launch them.
	if ( Device.os() != 'linux' || Environment.buildType == 'development' ) {
		return;
	}

	var path = require( 'path' );
	var Shortcut = require( 'client-voodoo' ).Shortcut;
	Shortcut.create( process.execPath, path.resolve( 'package/app/img/client/icon-256x256.png' ) );
} );
