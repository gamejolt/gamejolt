const argv = require( 'minimist' )( process.argv );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const plugins = require( 'gulp-load-plugins' )();
const sequence = require( 'run-sequence' );
const fs = require( 'fs' );
const os = require( 'os' );
const _ = require( 'lodash' );
const shell = require( 'gulp-shell' );
const path = require( 'path' );
const mv = require( 'mv' );
const cp = require( 'child_process' );

module.exports = function( config )
{
	const packageJson = require( path.resolve( __dirname, '../package.json' ) );
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

	const lzmaPath = path.join( 'node_modules', 'lzma-native' );
	const windowsMutexPath = path.join( 'node_modules', 'windows-mutex' );

	let gypTasks = [];
	gypTasks.push( 'cd ' + path.resolve( lzmaPath ) + ' && node-pre-gyp clean configure build --runtime=node-webkit --target=0.19.0 --target_arch=' + config.gypArch + ' --build-from-source --msvs_version=2015' );

	if ( config.platform == 'win' ) {
		gypTasks.push( 'cd ' + path.resolve( windowsMutexPath ) + ' && nw-gyp clean configure build --target=0.19.0 --arch=' + config.gypArch + ' --msvs_version=2015' );
	}

	gulp.task( 'client:gyp', shell.task( gypTasks ) );

	// For releasing to S3.
	// We have to gather all the builds into the versioned folder before pushing.
	let releaseDir = path.join( 'build/client/prod', 'v' + packageJson.version );
	let s3Dir = 's3://gjolt-data/data/client/releases/v' + packageJson.version;

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

	let appScripts = [
		'<script src="/app/modules/client.js"></script>',
	];

	let baseScripts = [
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
	const modifySections = config.sections.map( ( section ) =>
	{
		if ( section == 'app' ) {
			section = 'index';
		}

		gulp.task( 'client:modify-index:' + section, () =>
		{
			// Base tag for index.html is different.
			// App uses fallback mode for location since it's not served through a server.
			const base = '/' + section + '.html';

			return gulp.src( config.buildDir + '/' + section + '.html' )
				.pipe( plugins.replace( '<base href="/">', '<base href="' + base + '">' ) )
				.pipe( gulp.dest( config.buildDir ) );
		} );

		return 'client:modify-index:' + section;
	} );

	// Set it up as a post-html build task.
	gulp.task( 'html:post', modifySections );

	gulp.task( 'client:prepare', () =>
	{
		// Load in the client package.
		const packageJson = require( '../package.json' );
		let clientJson = require( '../client-package.json' );

		// Copy over values from main package.json to keep in sync.
		clientJson.version = packageJson.version;

		// Gotta pull the node_modules that we need.
		clientJson.dependencies = packageJson.dependencies;

		// Copy the package.json file over into the build directory.
		fs.writeFileSync( config.buildDir + '/package.json', JSON.stringify( clientJson ) );
		fs.writeFileSync( config.buildDir + '/update-hook.js', fs.readFileSync( path.resolve( './src/update-hook.js' ) ) );
	} );

	let nodeModuletasks = [
		'cd ' + config.buildDir + ' && npm install --production',
		'cd ' + path.resolve( config.buildDir, lzmaPath ) + ' && node-pre-gyp clean configure build --runtime=node-webkit --target=0.14.7 --target_arch=' + config.gypArch + ' --build-from-source --msvs_version=2015',
	];

	if ( config.platform == 'win' ) {
		nodeModuletasks.push( 'cd ' + path.resolve( config.buildDir, windowsMutexPath ) + ' && nw-gyp clean configure build --target=0.14.7 --arch=' + config.gypArch + ' --msvs_version=2015' );
		// nodeModuletasks.push( path.resolve( 'tasks/rid.exe' ) + ' ' + path.resolve( config.buildDir, lzmaPath, 'binding/lzma_native.node' ) + ' node.exe GameJoltClient.exe' );
		// nodeModuletasks.push( path.resolve( 'tasks/rid.exe' ) + ' ' + path.resolve( config.buildDir, windowsMutexPath, 'build/Release/CreateMutex.node' ) + ' node.exe GameJoltClient.exe' );
	}

	gulp.task( 'client:node-modules', shell.task( nodeModuletasks ) );

	/**
	 * Does the actual building into an NW executable.
	 */
	gulp.task( 'client:nw', ( cb ) =>
	{
		let clientJson = require( '../client-package.json' );
		let NWB = require( 'nwjs-builder' );

		// We want the name to be:
		// 'game-jolt-client' on linux - because kebabs rock
		// 'GameJoltClient' on win - so it shows up well in process list and stuff
		// 'Game Jolt Client' on mac - so it shows up well in Applications folder.
		let appName = 'game-jolt-client';
		if ( config.platform == 'win' ) {
			appName = 'GameJoltClient';
		}
		else if ( config.platform == 'osx' ) {
			appName = 'Game Jolt Client';
		}

		NWB.commands.nwbuild( config.buildDir, {
			// version: config.production ? '0.14.7' : '0.14.7-sdk',
			version: '0.14.7-sdk',
			platforms: config.platformArch,
			outputName: config.platformArch,
			outputDir: getReleaseDir(),
			executableName: appName,
			withFFmpeg: true,
			sideBySide: true,
			sideBySideZip: false,
			production: false, // We don't want nwjs builder to redo the node modules because we already did that in client:node-modules
			macIcns: 'src/app/img/client/mac.icns',
			winIco: 'src/app/img/client/winico.ico',
		},
		( err ) =>
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
		let packageJson = require( '../package.json' );
		return path.join( config.clientBuildDir, 'build' );
	}

	/**
	 * Packages up the client builds into archive files so they can be distributed easier.
	 */
	if ( config.platform == 'osx' ) {
		gulp.task( 'client:package', ( cb ) =>
		{
			let appdmg = require( 'appdmg' );
			let releaseDir = getReleaseDir();

			let dmg = appdmg( {
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

			dmg.on( 'progress', ( info ) => { console.log( info ); } );
			dmg.on( 'finish', () => { console.log( 'Finished building DMG.' ); cb(); } );
			dmg.on( 'error', ( err ) => { console.error( err );  cb( err ); } );
		} );
	}
	else if ( config.platform == 'win' ) {
		gulp.task( 'client:package', ( cb ) =>
		{
			let releaseDir = getReleaseDir();
			let packageJson = require( path.resolve( __dirname, '..', 'package.json' ) );

			let InnoSetup = require( './inno-setup' );
			let certFile = config.production ? path.resolve( __dirname, 'certs', 'cert.pfx' ) : path.resolve( 'tasks', 'vendor', 'gamejolt.com.pfx' );
			let certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';
			let builder = new InnoSetup( path.resolve( releaseDir, config.platformArch ), path.resolve( releaseDir ), packageJson.version, certFile, certPw.trim() );
			return builder.build();
		} );
	}
	else {
		gulp.task( 'client:package', () =>
		{
			let releaseDir = getReleaseDir();

			if ( config.production ) {
				return gulp.src( releaseDir + '/' + config.platformArch + '/**/*' )
					.pipe( plugins.tar( config.platformArch + '.tar' ) )
					.pipe( plugins.gzip() )
					.pipe( gulp.dest( releaseDir ) );
			}
		} );
	}

	if ( config.client ) {
		gulp.task( 'post', ( cb ) =>
		{
			if ( config.watching ) {
				return sequence( 'client:prepare', cb );
			}

			return sequence( 'client:prepare', 'client:node-modules', 'client:modify-urls', 'client:nw', 'client:package', cb );
		} );
	}
};
