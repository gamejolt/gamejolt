var fs = require( 'fs' );
var path = require( 'path' );
var childProcess = require( 'child_process' );

function cp( cmd, args )
{
	return new Promise( function ( resolve, reject )
	{
		childProcess.execFile( cmd, args, function ( err, stdout, stderr )
		{
			if ( err || stderr || stdout
			 ) {
				return reject( err || stderr || stdout );
			}
			resolve();
		} );
	} );
}

function shellEscape( str )
{
	return str.replace( / /g, '\\ ' );
}

var InnoSetup = function( appDir, outDir, version, certFile, certPw )
{
	this.appDir = appDir;
	this.outDir = outDir;
	this.version = version;
	this.certFile = certFile;
	this.certPw = certPw;
};

InnoSetup.prototype.build = function()
{
	var script = fs.readFileSync( path.resolve( __dirname, 'vendor', 'gamejolt.iss' ), { encoding: 'utf8' } );
	script = script
		.replace( /\{\{APP_DIR\}\}/g, shellEscape( this.appDir ) )
		.replace( /\{\{OUT_DIR\}\}/g, shellEscape( this.outDir ) )
		.replace( /\{\{APP_VERSION\}\}/g, this.version );

	var scriptFile = path.resolve( __dirname, 'vendor', 'tmp-gamejolt.iss' );
	fs.writeFileSync( scriptFile, script, { encoding: 'utf8' } );

	return cp( 'iscc.exe', [ '/Sbyparam=' + shellEscape( path.resolve( __dirname, 'vendor', 'signtool.exe' ) ) + ' sign /a /f ' + shellEscape( this.certFile ) + ' /p ' + this.certPw, '/Q', scriptFile ] );
};

module.exports = InnoSetup;