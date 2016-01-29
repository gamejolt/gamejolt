angular.module( 'App.Client.Info' ).service( 'Client_Info', function( Environment )
{
	var os = require( 'os' );
	var path = require( 'path' );

	this.getPackageJson = function()
	{
		var cwd = path.dirname( process.mainModule.filename );

		// Slightly different path on dev.
		var packagePath = path.resolve( cwd, '..', 'package.json' );
		if ( Environment.env == 'development' ) {
			packagePath = path.resolve( cwd, 'package.json' );
		}

		return require( packagePath );
	};

	this.getVersion = function()
	{
		return this.getPackageJson().version;
	};
} );
