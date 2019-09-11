const argv = require('minimist')(process.argv);
const os = require('os');
const gulp = require('gulp');
const shell = require('gulp-shell');
const FwdRef = require('undertaker-forward-reference');

// https://github.com/gulpjs/undertaker-forward-reference
// https://github.com/gulpjs/gulp/issues/802
gulp.registry(FwdRef());

module.exports = (config, projectBase) => {
	function filterSections(func) {
		const sections = {};
		for (const section in config.sections) {
			const sectionConfig = config.sections[section];
			if (func(sectionConfig, section)) {
				sections[section] = sectionConfig;
			}
		}
		return sections;
	}

	config.production = argv.production || false;
	config.watching = argv._.indexOf('watch') !== -1 ? 'initial' : false;
	config.write = argv.fs || false;
	config.analyze = argv.analyze || false;
	config.ssr = argv.ssr || false; // 'client' | 'server' | false
	config.client = argv.client || false;

	// If true, will not push the client package using gjpush.
	config.noGjPush = argv.noGjPush || false;

	// If true, the client package will be pushed to the test package.
	config.useTestPackage = argv.useTestPackage || false;

	config.noClean = argv.noClean || false;

	// Whether or not the environment of angular should be production or development.
	// Even when not doing prod builds we use the prod environment by default.
	// This way it's easy for anyone to build without the GJ dev environment.
	// You can pass this flag in to include the dev environment config for angular instead.
	config.developmentEnv = argv.development || false;

	// If true, will enable the auto updater checks for the client package.
	config.withUpdater = argv.withUpdater || false;

	config.port = config.port || argv.port || 8080;

	config.translationSections = config.translationSections || [];
	config.buildSection = argv['section'] || 'app';

	if (config.ssr === 'server') {
		config.sections = filterSections(i => i.server);
	} else if (config.client) {
		config.sections = filterSections(i => i.client);
	}

	if (argv['section']) {
		const newConfigSections = {};

		const argSections = argv['section'].split(',');
		for (let argSection of argSections) {
			newConfigSections[argSection] = config.sections[argSection];
		}

		config.sections = newConfigSections;
	}

	config.projectBase = projectBase;
	config.buildBaseDir = process.env.BUILD_DIR || './';
	config.buildDir = config.buildBaseDir + (config.production ? 'build/prod' : 'build/dev');
	config.libDir = 'src/lib/';

	if (config.client || config.ssr) {
		config.write = true;
	}

	if (config.ssr === 'server') {
		config.buildDir += '-server';
	} else if (config.client) {
		config.buildDir += '-client';
		config.clientBuildDir = config.buildDir + '-build';
		config.clientBuildCacheDir = config.buildDir + '-cache';

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

		config.platformArch = config.platform + config.arch;
	}

	require('./clean.js')(config);
	require('./translations.js')(config);
	require('./client.js')(config);
	require('./webpack.js')(config);
};
