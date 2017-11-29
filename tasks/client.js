const argv = require('minimist')(process.argv);
const gulp = require('gulp');
const gutil = require('gulp-util');
const plugins = require('gulp-load-plugins')();
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const shell = require('gulp-shell');
const path = require('path');
// const mv = require('mv');

module.exports = config => {
	const packageJson = require(path.resolve(__dirname, '../package.json'));
	config.arch = argv.arch || '64';

	// Get our platform that we are building on.
	switch (os.type()) {
		case 'Linux':
			config.platform = 'linux';
			break;

		case 'Windows_NT':
			config.platform = 'win';
			break;

		case 'Darwin':
			config.platform = 'osx';
			break;

		default:
			throw new Error('Can not build client on your OS type.');
	}

	// For releasing to S3.
	// We have to gather all the builds into the versioned folder before pushing.
	const releaseDir = path.join('build/prod-client', 'v' + packageJson.version);
	const s3Dir = 's3://gjolt-data/data/client/releases/v' + packageJson.version;

	gulp.task(
		'client:push-releases',
		shell.task([
			'aws s3 cp ' +
				releaseDir +
				'/linux64.tar.gz ' +
				s3Dir +
				'/game-jolt-client.tar.gz --acl public-read',
			'aws s3 cp ' +
				releaseDir +
				'/linux64-package.tar.gz ' +
				s3Dir +
				'/linux64-package.tar.gz --acl public-read',

			'aws s3 cp ' + releaseDir + '/osx.dmg ' + s3Dir + '/GameJoltClient.dmg --acl public-read',
			'aws s3 cp ' +
				releaseDir +
				'/osx64-package.tar.gz ' +
				s3Dir +
				'/osx64-package.tar.gz --acl public-read',

			'aws s3 cp ' +
				releaseDir +
				'/Setup.exe ' +
				s3Dir +
				'/GameJoltClientSetup.exe --acl public-read',
			'aws s3 cp ' +
				releaseDir +
				'/win32-package.tar.gz ' +
				s3Dir +
				'/win32-package.tar.gz --acl public-read',
		])
	);

	// We can skip all this stuff if not doing a client build.
	if (!config.client) {
		return;
	}

	config.platformArch = config.platform + config.arch;

	// TODO(client): Do in webpack somehow
	// // Injections to modify App for client build.
	// config.injections = {
	// 	// Attach a class to say that we're in client.
	// 	// Makes it easy to target client before angular has loaded in completely with CSS.
	// 	'<body class="" ': '<body class="is-client" ',

	// 	// GA tag is different.
	// 	"ga('create', 'UA-6742777-1', 'auto');": "ga('create', 'UA-6742777-16', 'auto');",
	// };

	// /**
	//  * Modify base tags for main HTML files.
	//  * This is needed for non-html5 location fallback.
	//  */
	// const modifySections = config.sections.map(section => {
	// 	if (section === 'app') {
	// 		section = 'index';
	// 	}

	// 	gulp.task('client:modify-index:' + section, () => {
	// 		// Base tag for index.html is different.
	// 		// App uses fallback mode for location since it's not served through a server.
	// 		let base = '/' + section + '.html';

	// 		// When packaged up, we put it in the sub-folder: "package".
	// 		if (!config.watching && os.type() !== 'Darwin') {
	// 			base = '/package' + base;
	// 		}

	// 		return gulp
	// 			.src(config.buildDir + '/' + section + '.html')
	// 			.pipe(plugins.replace('<base href="/">', '<base href="' + base + '">'))
	// 			.pipe(gulp.dest(config.buildDir));
	// 	});

	// 	return 'client:modify-index:' + section;
	// });

	// // Set it up as a post-html build task.
	// gulp.task('html:post', gulp.parallel(modifySections));

	// TODO(client): Update hook?
	// gulp.task('client:prepare', cb => {
	// 	// Load in the client package.
	// 	const packageJson = require('../package.json');
	// 	const clientJson = require('../client-package.json');

	// 	// Copy over values from main package.json to keep in sync.
	// 	clientJson.version = packageJson.version;

	// 	// Gotta pull the node_modules that we need.
	// 	clientJson.dependencies = packageJson.dependencies;

	// 	// If we're in dev, then add the toolbar for debugging.
	// 	if (!config.production) {
	// 		clientJson.window.toolbar = true;
	// 	}

	// 	if (!config.watching && os.type() !== 'Darwin') {
	// 		// We set the base directory to use the "package" folder.
	// 		clientJson.main = 'app://game-jolt-client/package/index.html#!/';
	// 		clientJson.window.icon = 'package/' + clientJson.window.icon;
	// 	}

	// 	// Copy the package.json file over into the build directory.
	// 	fs.writeFileSync(config.buildDir + '/package.json', JSON.stringify(clientJson));
	// 	fs.writeFileSync(
	// 		config.buildDir + '/update-hook.js',
	// 		fs.readFileSync(path.resolve('./src/update-hook.js'))
	// 	);

	// 	cb();
	// });

	gulp.task(
		'client:node-modules',
		shell.task(['cd ' + config.buildDir + ' && npm install --production'])
	);

	// TODO(client): do in webpack base url
	// /**
	//  * This should rewrite all file references to have the correct packaged folder prefix.
	//  */
	// gulp.task('client:modify-urls', cb => {
	// 	if (os.type() === 'Darwin') {
	// 		cb();
	// 		return;
	// 	}

	// 	const revAll = new plugins.revAll({
	// 		prefix: 'app://game-jolt-client/package',
	// 		dontGlobal: [/^\/node_modules\/.*$/, /^\/tmp\/.*$/],
	// 		dontRenameFile: [/^.*$/], // Don't rename anything.
	// 		transformFilename: function(file, hash) {
	// 			// Don't rename the file reference at all, either.
	// 			return path.basename(file.path);
	// 		},
	// 		debug: true,
	// 	});

	// 	// Ignore folders from the very beginning speeds up the injection a lot.
	// 	return gulp
	// 		.src([
	// 			config.buildDir + '/**',
	// 			'!' + config.buildDir + '/node_modules/**',
	// 			'!' + config.buildDir + '/tmp/**',
	// 		])
	// 		.pipe(revAll.revision())
	// 		.pipe(gulp.dest(config.buildDir));
	// });

	/**
	 * Does the actual building into an NW executable.
	 */
	gulp.task('client:nw', () => {
		const packageJson = require(config.base + '/package.json');
		const NwBuilder = require('nw-builder');

		// We want the name to be:
		// 'game-jolt-client' on linux - because kebabs rock
		// 'GameJoltClient' on win - so it shows up well in process list and stuff
		// 'Game Jolt Client' on mac - so it shows up well in Applications folder.
		let appName = 'game-jolt-client';
		if (config.platform === 'win') {
			appName = 'GameJoltClient';
		} else if (config.platform === 'osx') {
			appName = 'Game Jolt Client';
		}

		const nw = new NwBuilder({
			version: '0.12.3',
			files: config.buildDir + '/**/*',
			buildDir: config.clientBuildDir,
			cacheDir: config.clientBuildCacheDir,
			platforms: [config.platformArch],
			appName: appName,
			buildType: () => {
				// return 'v' + this.appVersion;
				return 'build';
			},
			appVersion: packageJson.version,
			macZip: false, // Use a app.nw folder instead of ZIP file
			macIcns: 'src/app/img/client/mac.icns',
			winIco: 'src/app/img/client/winico.ico',

			// Tells it not to merge the app zip into the executable. Easier updating this way.
			mergeApp: false,
		});

		nw.on('log', console.log);

		return nw.build();
	});

	/**
	 * When packaging up the client, we need to push all the app files into a "package" folder. We
	 * do this so we can update really easily. This unzips the package.nw folder that nw-builder
	 * creates and pushes it into a "package" folder.
	 */
	gulp.task('client:nw-unpackage', cb => {
		const base = path.join(config.clientBuildDir, config.platformArch);
		const packagePath = path.join(config.clientBuildDir, config.platformArch + '-package.zip');

		if (config.platform !== 'osx') {
			fs.renameSync(path.join(base, 'package.nw'), packagePath);

			const DecompressZip = require('decompress-zip');
			const unzipper = new DecompressZip(packagePath);

			unzipper.on('error', cb);
			unzipper.on('extract', () => {
				const stream = gulp
					.src(base + '/package/**/*')
					.pipe(plugins.tar(config.platformArch + '-package.tar'))
					.pipe(plugins.gzip())
					.pipe(gulp.dest(config.clientBuildDir));

				stream.on('error', cb);
				stream.on('end', () => {
					mv(path.join(base, 'package', 'node_modules'), path.join(base, 'node_modules'), err => {
						if (err) {
							throw err;
						}
						mv(path.join(base, 'package', 'package.json'), path.join(base, 'package.json'), err => {
							if (err) {
								throw err;
							}
							cb();
						});
					});
				});
			});

			unzipper.extract({ path: path.join(base, 'package') });
		} else {
			const stream = gulp
				.src(base + '/Game Jolt Client.app/Contents/Resources/app.nw/**/*')
				.pipe(plugins.tar(config.platformArch + '-package.tar'))
				.pipe(plugins.gzip())
				.pipe(gulp.dest(releaseDir));

			stream.on('end', cb);
			stream.on('error', cb);
		}
	});

	/**
	 * Packages up the client builds into archive files so they can be distributed easier.
	 */
	gulp.task('client:package', cb => {
		if (config.platform === 'osx') {
			const appdmg = require('appdmg');

			const dmg = appdmg({
				target: config.clientBuildDir + '/osx.dmg',
				basepath: path.resolve(__dirname, '..'),
				specification: {
					title: 'Game Jolt Client',
					icon: 'src/app/img/client/mac.icns',
					background: 'src/app/img/client/dmg-background.png',
					'icon-size': 80,
					contents: [
						{
							x: 195,
							y: 370,
							type: 'file',
							path: config.clientBuildDir + '/' + config.platformArch + '/Game Jolt Client.app',
						},
						{ x: 429, y: 370, type: 'link', path: '/Applications' },
					],
				},
			});

			dmg.on('progress', info => {
				console.log(info);
			});
			dmg.on('finish', () => {
				console.log('Finished building DMG.');
				cb();
			});
			dmg.on('error', err => {
				console.error(err);
				cb(err);
			});
		} else if (config.platform === 'win') {
			const packageJson = require(path.resolve(__dirname, '..', 'package.json'));

			const InnoSetup = require('./inno-setup');
			const certFile = config.production
				? path.resolve(__dirname, 'certs', 'cert.pfx')
				: path.resolve('tasks', 'vendor', 'cert.pfx');
			const certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';
			const builder = new InnoSetup(
				path.resolve(config.clientBuildDir, config.platformArch),
				path.resolve(config.clientBuildDir),
				packageJson.version,
				certFile,
				certPw.trim()
			);
			return builder.build();
		} else {
			if (!config.production) {
				cb();
				return;
			}

			return gulp
				.src(config.clientBuildDir + '/' + config.platformArch + '/**/*')
				.pipe(plugins.tar(config.platformArch + '.tar'))
				.pipe(plugins.gzip())
				.pipe(gulp.dest(config.clientBuildDir));
		}
	});

	if (config.client) {
		if (config.watching) {
			gulp.task('post', gulp.series('client:prepare'));
		} else {
			gulp.task(
				'post',
				gulp.series(
					'client:prepare',
					'client:node-modules',
					'client:modify-urls',
					'client:nw',
					'client:nw-unpackage',
					'client:package'
				)
			);
		}
	}
};
