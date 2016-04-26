var fs = require( 'fs' );
var path = require( 'path' );

function copy( source, target )
{
	return new Promise( function( resolve, reject )
	{
		var readStream = fs.createReadStream( source );
		readStream.on( 'error', reject );

		var writeStream = fs.createWriteStream( target );
		writeStream.on('error', reject );

		writeStream.on( 'close', function()
		{
			resolve();
		} );

		readStream.pipe( writeStream );
	} );
}

function unlink( source )
{
	return new Promise( function( resolve, reject )
	{
		fs.unlink( source, function( err )
		{
			if ( err ) {
				return reject( err );
			}
			resolve();
		} );
	} );
}

function rename( source, target )
{
	return new Promise( function( resolve, reject )
	{
		fs.rename( source, target, function( err )
		{
			if ( err ) {
				return reject( err );
			}
			resolve();
		} );
	} );
}

module.exports.pre = function( version, packagePath )
{
	var nodeModules, gameWrapper;
	switch ( process.platform )
	{
		case 'win32':
			nodeModules = path.join( packagePath, '..', 'node_modules' );
			gameWrapper = 'game_jolt_game_wrapper_win32.exe';
			break;

		case 'linux':
			nodeModules = path.join( packagePath, '..', 'node_modules' );
			gameWrapper = 'game_jolt_game_wrapper_linux';
			break;

		case 'darwin':
			nodeModules = path.join( packagePath, 'node_modules' );
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

		var shouldContinue = true;
		return unlink( gameWrapperPath + '.2' )
			.catch( function( err ) {} )
			.then( function()
			{
				return copy( gameWrapperPath, gameWrapperPath + '.2' );
			} )
			.catch( function( err )
			{
				console.log( 'Failed to copy ' + gameWrapperPath + ' (' + err.message + '). Aborting update.' );
				shouldContinue = false;
			} )
			.then( function()
			{
				if ( !shouldContinue ) {
					return;
				}

				return unlink( gameWrapperPath );
			} )
			.catch ( function( err )
			{
				console.log( 'Failed to unlink ' + gameWrapperPath + ' (' + err.message + '). Aborting update.' );
				shouldContinue = false;
			} )
			.then( function()
			{
				if ( !shouldContinue ) {
					return;
				}

				return rename( gameWrapperPath + '.2', gameWrapperPath );
			} )
			.catch( function( err )
			{
				console.log( 'Failed to rename ' + gameWrapperPath + '.2 back (' + err.message + '). Continuing anyways.' );
			} )
			.then( function()
			{
				return shouldContinue;
			} );
	} );
};

module.exports.post = function( version, packagePath )
{
	return Promise.resolve();
};
