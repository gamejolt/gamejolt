var argv = require( 'minimist' )( process.argv );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var sequence = require( 'run-sequence' );
var fs = require( 'fs' );
var os = require( 'os' );
var _ = require( 'lodash' );
var shell = require( 'gulp-shell' );
var path = require( 'path' );
var mv = require( 'mv' );
var cp = require( 'child_process' );

module.exports = function( config )
{
	var packageJson = require( path.resolve( __dirname, '../package.json' ) );
	config.client = argv.client || false;
	config.arch = argv.arch || '64';
	config.gypArch = config.arch == '64' ? 'x64' : 'ia32';

	// Get our platform that we are building on.
	switch ( os.type() ) {
		case 'Linux':
			config.platform = 'linux'; break;

		case 'Windows_NT':
			config.platform = 'win'; break;

		case 'Darwin':
			config.platform = 'osx'; break;

		default:
			throw new Error( 'Can not build client on your OS type.' );
	}

	// On Windows builds we have to use npm3. For other OSes it's faster to do npm2.
	// npm3 does a flat directory structure in node_modules, so the path is different.
	// We have to find where the lzma-native path is so we can compile it.
	var lzmaPath = path.join( 'node_modules', 'lzma-native' );
	try {
		// Will throw if no path exists.
		fs.statSync( path.resolve( lzmaPath ) );
	}
	catch ( e ) {
		lzmaPath = path.join( 'node_modules', 'client-voodoo', 'node_modules', 'lzma-native' );
	}

	var windowsMutexPath = path.join( 'node_modules', 'windows-mutex' );
	if ( config.platform === 'win' ) {
		try {
			// Will throw if no path exists.
			fs.statSync( path.resolve( windowsMutexPath ) );
		}
		catch ( e ) {
			windowsMutexPath = path.join( 'node_modules', 'client-voodoo', 'node_modules', 'windows-mutex' );
		}
	}

	var gypTasks = [
		'cd ' + path.resolve( lzmaPath ) + ' && node-pre-gyp clean configure build --runtime=node-webkit --target=0.14.7 --target_arch=' + config.gypArch + ' --build-from-source --msvs_version=2015',
	];
	if ( config.platform == 'win' ) {
		gypTasks.push( 'cd ' + path.resolve( windowsMutexPath ) + ' && nw-gyp clean configure build --target=0.14.7 --arch=' + config.gypArch + ' --msvs_version=2015' );
	}

	gulp.task( 'client:gyp', shell.task( gypTasks ) );

	// For releasing to S3.
	// We have to gather all the builds into the versioned folder before pushing.
	var releaseDir = path.join( 'build/client/prod', 'v' + packageJson.version );
	var s3Dir = 's3://gjolt-data/data/client/releases/v' + packageJson.version;

	gulp.task( 'client:push-releases', shell.task( [
		'aws s3 cp ' + releaseDir + '/linux64.tar.gz ' + s3Dir + '/game-jolt-client.tar.gz --acl public-read',
		'aws s3 cp ' + releaseDir + '/linux64-package.tar.gz ' + s3Dir + '/linux64-package.tar.gz --acl public-read',

		'aws s3 cp ' + releaseDir + '/osx.dmg ' + s3Dir + '/GameJoltClient.dmg --acl public-read',
		'aws s3 cp ' + releaseDir + '/osx64-package.tar.gz ' + s3Dir + '/osx64-package.tar.gz --acl public-read',

		'aws s3 cp ' + releaseDir + '/Setup.exe ' + s3Dir + '/GameJoltClientSetup.exe --acl public-read',
		'aws s3 cp ' + releaseDir + '/win32-package.tar.gz ' + s3Dir + '/win32-package.tar.gz --acl public-read',
	] ) );

	// We can skip all this stuff if not doing a client build.
	if ( !config.client ) {
		return;
	}

	config.platformArch = config.platform + config.arch;
	config.includeNode = true;  // Include nodejs files.
	config.noInject = true;  // Don't revision filenames.
	config.noSourcemaps = true;  // Reduce package size. Not needed.

	config.clientBuildCacheDir = 'build/client/cache';

	if ( config.production ) {
		config.buildDir = 'build/client/prod/source';
		config.clientBuildDir = 'build/client/prod';
	}
	else {
		config.buildDir = 'build/client/dev/source';
		config.clientBuildDir = 'build/client/dev';
	}

	var appScripts = [
		'<script src="/app/modules/client.js"></script>',
	];

	var baseScripts = [
		'<script src="/app/modules/client.js"></script>',
		'<script src="/app/modules/client-base.js"></script>',
	];

	if ( config.production ) {
		appScripts.push( '<script src="/app/modules/client-updater.js"></script>' );
		baseScripts.push( '<script src="/app/modules/client-updater.js"></script>' );
	}

	// Injections to modify App for client build.
	config.injections = {
		'/* inject client:modules */': "'App.Client',",
		'<!-- inject client:modules -->': appScripts.join( ' ' ),

		// For other sections we don't load the whole client JS but only load the angular modules we want
		// through the base-client.js module.
		'/* inject client:base:modules */': "'App.ClientBase',",
		'<!-- inject client:base:modules -->': baseScripts.join( ' ' ),

		// Attach a class to say that we're in client.
		// Makes it easy to target client before angular has loaded in completely with CSS.
		'<body class="" ': '<body class="is-client" ',

		// GA tag is different.
		"ga('create', 'UA-6742777-1', 'auto');": "ga('create', 'UA-6742777-16', 'auto');",
	};

	/**
	 * Modify base tags for main HTML files.
	 * This is needed for non-html5 location fallback.
	 */
	var modifySections = config.sections.map( function( section )
	{
		if ( section == 'app' ) {
			section = 'index';
		}

		gulp.task( 'client:modify-index:' + section, function()
		{
			// Base tag for index.html is different.
			// App uses fallback mode for location since it's not served through a server.
			var base = '/' + section + '.html';

			// When packaged up, we put it in the sub-folder: "package".
			if ( !config.watching && os.type() != 'Darwin' ) {
				base = '/package' + base;
			}

			return gulp.src( config.buildDir + '/' + section + '.html' )
				.pipe( plugins.replace( '<base href="/">', '<base href="' + base + '">' ) )
				.pipe( gulp.dest( config.buildDir ) );
		} );

		return 'client:modify-index:' + section;
	} );

	// Set it up as a post-html build task.
	gulp.task( 'html:post', modifySections );

	gulp.task( 'client:prepare', function()
	{
		// Load in the client package.
		var packageJson = require( '../package.json' );
		var clientJson = require( '../client-package.json' );

		// Copy over values from main package.json to keep in sync.
		clientJson.version = packageJson.version;

		// Gotta pull the node_modules that we need.
		clientJson.dependencies = packageJson.dependencies;

		if ( !config.watching && os.type() != 'Darwin' ) {

			// We set the base directory to use the "package" folder.
			clientJson.main = 'chrome-extension://game-jolt-client/package/index.html#!/';
			clientJson.window.icon = 'package/' + clientJson.window.icon;
		}

		// Copy the package.json file over into the build directory.
		fs.writeFileSync( config.buildDir + '/package.json', JSON.stringify( clientJson ) );
		fs.writeFileSync( config.buildDir + '/update-hook.js', fs.readFileSync( path.resolve( './src/update-hook.js' ) ) );
	} );

	var nodeModuletasks = [
		'cd ' + config.buildDir + ' && npm install --production',
		'dir ' + path.join( config.buildDir, 'node_modules' ),
		'cd ' + path.resolve( config.buildDir, lzmaPath ) + ' && node-pre-gyp clean configure build --runtime=node-webkit --target=0.14.7 --target_arch=' + config.gypArch + ' --build-from-source --msvs_version=2015',
	];

	// http://developers.ironsrc.com/rename-import-dll/
	if ( config.platform == 'win' ) {
		nodeModuletasks.push( 'cd ' + path.resolve( config.buildDir, windowsMutexPath ) + ' && nw-gyp clean configure build --target=0.14.7 --arch=' + config.gypArch + ' --msvs_version=2015' );
		// nodeModuletasks.push( path.resolve( 'tasks/rid.exe' ) + ' ' + path.resolve( config.buildDir, lzmaPath, 'binding/lzma_native.node' ) + ' node.exe GameJoltClient.exe' );
		// nodeModuletasks.push( path.resolve( 'tasks/rid.exe' ) + ' ' + path.resolve( config.buildDir, windowsMutexPath, 'build/Release/CreateMutex.node' ) + ' node.exe GameJoltClient.exe' );
	}

	gulp.task( 'client:node-modules', shell.task( nodeModuletasks ) );

	/**
	 * This should rewrite all file references to have the correct packaged folder prefix.
	 */
	gulp.task( 'client:modify-urls', function()
	{
		if ( os.type() == 'Darwin' ) {
			return;
		}

		var revAll = new plugins.revAll( {
			prefix: 'chrome-extension://game-jolt-client/package',
			dontGlobal: [
				/^\/node_modules\/.*$/,
				/^\/tmp\/.*$/,
			],
			dontRenameFile: [ /^.*$/ ],  // Don't rename anything.
			transformFilename: function( file, hash )
			{
				// Don't rename the file reference at all, either.
				return path.basename( file.path );
			},
			debug: true,
		} );

		// Ignore folders from the very beginning speeds up the injection a lot.
		return gulp.src( [
				config.buildDir + '/**',
				'!' + config.buildDir + '/node_modules/**',
				'!' + config.buildDir + '/tmp/**',
			] )
			.pipe( revAll.revision() )
			.pipe( gulp.dest( config.buildDir ) );
	} );

	/**
	 * Does the actual building into an NW executable.
	 */
	gulp.task( 'client:nw', function( cb )
	{
		var clientJson = require( '../client-package.json' );
		var NWB = require( 'nwjs-builder' );

		// We want the name to be:
		// 'game-jolt-client' on linux - because kebabs rock
		// 'GameJoltClient' on win - so it shows up well in process list and stuff
		// 'Game Jolt Client' on mac - so it shows up well in Applications folder.
		var appName = 'game-jolt-client';
		if ( config.platform == 'win' ) {
			appName = 'GameJoltClient';
		}
		else if ( config.platform == 'osx' ) {
			appName = 'Game Jolt Client';
		}

		NWB.commands.nwbuild( config.buildDir, {
			version: config.production ? '0.14.7' : '0.14.7-sdk',
			platforms: config.platformArch,
			outputName: config.platformArch,
			outputDir: getReleaseDir(),
			executableName: appName,
			withFFmpeg: true,
			sideBySide: true,
			sideBySideZip: path.join( getReleaseDir(), config.platformArch + '-package.zip' ), // Simulate what nw-builder does with side-by-side
			production: false, // We don't want nwjs builder to redo the node modules because we already did that in client:node-modules
			macIcns: 'src/app/img/client/mac.icns',
			winIco: 'src/app/img/client/winico.ico',
		}, function( err )
		{
			if ( err ) {
				throw err;
			}

			setTimeout( cb, 1000 ); // Delay finishing the task because for some reason file isn't fully flushed when this returns.
		} );
	} );

	// We have to load paths only when we're actually running the gulp task.
	// Otherwise the client config gulp task won't have a chance to run.
	function getReleaseDir()
	{
		// Load in the client package.
		var packageJson = require( '../package.json' );
		return path.join( config.clientBuildDir, 'build' );
	}

	/**
	 * When packaging up the client, we need to push all the app files into a "package" folder.
	 * We do this so we can update really easily.
	 * This unzips the package.nw folder that nw-builder creates and pushes it into a "package" folder.
	 */
	gulp.task( 'client:nw-unpackage', function( cb )
	{
		var releaseDir = getReleaseDir();
		var base = path.join( releaseDir, config.platformArch );
		var packagePath = path.join( releaseDir, config.platformArch + '-package.zip' )

		if ( config.platform != 'osx' ) {

			var DecompressZip = require( 'decompress-zip' );
			var unzipper = new DecompressZip( packagePath );

			unzipper.on( 'error', cb );
			unzipper.on( 'extract', function()
			{
				var stream = gulp.src( base + '/package/**/*' )
					.pipe( plugins.tar( config.platformArch + '-package.tar' ) )
					.pipe( plugins.gzip() )
					.pipe( gulp.dest( releaseDir ) );

				stream.on( 'error', cb );
				stream.on( 'end', function()
				{
					mv( path.join( base, 'package', 'node_modules' ), path.join( base, 'node_modules' ), function( err )
					{
						if ( err ) {
							throw err;
						}
						mv( path.join( base, 'package', 'package.json' ), path.join( base, 'package.json' ), function( err )
						{
							if ( err ) {
								throw err;
							}
							cb();
						} );
					} );
				} );
			} );

			unzipper.extract( { path: path.join( base, 'package' ) } );
		}
		else {
			var stream = gulp.src( base + '/Game Jolt Client.app/Contents/Resources/app.nw/**/*' )
				.pipe( plugins.tar( config.platformArch + '-package.tar' ) )
				.pipe( plugins.gzip() )
				.pipe( gulp.dest( releaseDir ) );

			stream.on( 'end', cb );
			stream.on( 'error', cb );
		}
	} );

	/**
	 * Packages up the client builds into archive files so they can be distributed easier.
	 */
	if ( config.platform == 'osx' ) {
		gulp.task( 'client:package', function( cb )
		{
			var appdmg = require( 'appdmg' );
			var releaseDir = getReleaseDir();

			var dmg = appdmg( {
				target: releaseDir + '/osx.dmg',
				basepath: path.resolve( __dirname, '..' ),
				specification: {
					title: 'Game Jolt Client',
					icon: 'src/app/img/client/mac.icns',
					background: 'src/app/img/client/dmg-background.png',
					'icon-size': 80,
					contents: [
						{ x: 195, y: 370, type: 'file', path: releaseDir + '/' + config.platformArch + '/Game Jolt Client.app' },
						{ x: 429, y: 370, type: 'link', path: '/Applications' }
					],
				}
			} );

			dmg.on( 'progress', function( info ){ console.log( info ); } );
			dmg.on( 'finish', function(){ console.log( 'Finished building DMG.' ); cb(); } );
			dmg.on( 'error', function( err ){ console.error( err );  cb( err ); } );
		} );
	}
	else if ( config.platform == 'win' ) {
		gulp.task( 'client:package', function( cb )
		{
			var releaseDir = getReleaseDir();
			var packageJson = require( path.resolve( __dirname, '..', 'package.json' ) );

			var InnoSetup = require( './inno-setup' );
			var certFile = config.production ? path.resolve( __dirname, 'certs', 'cert.pfx' ) : path.resolve( 'tasks', 'vendor', 'gamejolt.com.pfx' );
			var certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';
			var builder = new InnoSetup( path.resolve( releaseDir, config.platformArch ), path.resolve( releaseDir ), packageJson.version, certFile, certPw.trim() );
			return builder.build();
		} );
	}
	else {
		gulp.task( 'client:package', function()
		{
			var releaseDir = getReleaseDir();

			if ( config.production ) {
				return gulp.src( releaseDir + '/' + config.platformArch + '/**/*' )
					.pipe( plugins.tar( config.platformArch + '.tar' ) )
					.pipe( plugins.gzip() )
					.pipe( gulp.dest( releaseDir ) );
			}
		} );
	}

	if ( config.client ) {
		gulp.task( 'post', function( cb )
		{
			if ( config.watching ) {
				return sequence( 'client:prepare', cb );
			}

			return sequence( 'client:prepare', 'client:node-modules', 'client:modify-urls', 'client:nw', 'client:nw-unpackage', 'client:package', cb );
		} );
	}
};
