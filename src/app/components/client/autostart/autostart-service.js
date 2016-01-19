angular.module( 'App.Client.Autostart' )
.run( function( Client_Autostart )
{
	Client_Autostart.init();
} )
.service( 'Client_Autostart', function( $q, Device, Environment, Settings )
{
	var Autostarter = require( 'client-voodoo' ).Autostarter;
	var execPath = process.execPath;

	this.canAutostart = function()
	{
		if ( Environment.env != 'production' || Device.os() != 'windows' ) {
			return false;
		}
		return true;
	};

	this.init = function()
	{
		if ( Settings.get( 'autostart-client' ) ) {
			this.set();
		}
	};

	this.set = angular.noop;
	this.clear = angular.noop;
	this.check = angular.noop;

	if ( !this.canAutostart() ) {
		return;
	}

	this.set = function()
	{
		return $q.when( Autostarter.set( execPath, [ '--silent-start' ] ) );
	};

	this.clear = function()
	{
		return $q.when( Autostarter.unset() );
	};

	this.check = function()
	{
		return $.when( Autostarter.isset() );
	};
} );
