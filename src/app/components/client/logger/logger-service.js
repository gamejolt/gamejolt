angular.module( 'App.Client.Logger' ).service( 'Client_Logger', function()
{
	this.getLogInfo = function( description )
	{
		var Logger = require( 'client-voodoo' ).Logger;
		return Logger.getClientLog( description );
	};
} );
