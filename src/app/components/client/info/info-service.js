angular.module( 'App.Client.Info' ).service( 'Client_Info', function()
{
	var os = require( 'os' );
	var path = require( 'path' );

	this.getPackageJson = function()
	{
		var cwd = path.dirname( process.mainModule.filename );
		return require( path.resolve( cwd, 'package.json' ) );
	};

	this.getVersion = function()
	{
		return this.getPackageJson().version;
	};
} );
