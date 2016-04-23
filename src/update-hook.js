var fs = require( 'fs' );
var path = require( 'path' );

module.exports.pre = function( version, packagePath )
{
	var nodeModules, gameWrapper;
	switch ( process.platform )
	{
		case 'win32':
			nodeModules = path.join( packagePath, 'node_modules' );
			gameWrapper = 'game_jolt_game_wrapper_win32.exe';
			break;

		case 'linux':
			nodeModules = path.join( packagePath, 'node_modules' );
			gameWrapper = 'game_jolt_game_wrapper_linux';
			break;

		case 'darwin':
			nodeModules = path.join( packagePath, 'app.nw', 'node_modules' );
			gameWrapper = 'game_jolt_game_wrapper_osx';
			break;
	}

	return new Promise( function( resolve, reject )
	{
		var gameWrapperPath = path.join( nodeModules, 'client-game-wrapper', 'bin', gameWrapper );
		console.log( 'Searching for ' + gameWrapper + ' in ' + gameWrapperPath );
		fs.stat( gameWrapperPath, function( err, stats )
		{
			if ( err ) {
				gameWrapperPath = path.join( nodeModules, 'client-voodoo', 'node_modules', 'client-game-wrapper', 'bin', gameWrapper );
				console.log( 'Searching for ' + gameWrapper + ' in ' + gameWrapperPath );
				fs.stat( gameWrapperPath, function( err2, stats2 )
				{
					if ( err2 ) {
						resolve( null );
					}
					else {
						resolve( gameWrapperPath );
					}
				} );
			}
			else {
				resolve( gameWrapperPath );
			}
		} );
	} ).then( function( gameWrapperPath )
	{
		if ( !gameWrapperPath ) {
			console.log( gameWrapper + ' does not exist anywhere we\'re expecting to. Assuming we can continue update.' );
			return true;
		}

		return new Promise( function( resolve, reject )
		{
			fs.rename( gameWrapperPath, gameWrapperPath + '.2', function( err )
			{
				if ( err ) {
					console.log( 'Failed to rename ' + gameWrapperPath + ' (' + err.message + '). Aborting update.' );
					return resolve( false );
				}

				try {
					fs.renameSync( gameWrapperPath + '.2', gameWrapperPath )
				}
				catch ( err ) {
					console.log( 'Failed to rename ' + gameWrapperPath + '.2 back (' + err.message + '). Continuing anyways.' );
					return resolve( true );
				}

				console.log( 'Renamed ' + gameWrapperPath + ' successfully. Updating.')
				return resolve( true );
			} );
		} );
	} );
};

module.exports.post = function( version, packagePath )
{
	return Promise.resolve();
};
