const gulp = require('gulp');
const shell = require('gulp-shell');
const path = require('path');

const config = {
	staticCdn: 'https://b6d3e9q9.ssl.hwcdn.net',
	injectVersion: 2,
	framework: 'vue',
	sections: ['auth', 'checkout', 'claim', 'site-editor'],
	serverSections: ['auth', 'app'],
	translations: 'site-translations',
	translationSections: {
		auth: ['auth/'],
		dash: [
			'app/components/forms/dashboard',
			'app/components/forms/site-analytics',
			'app/views/dashboard',
		],
		checkout: ['checkout/'],
		claim: ['claim/'],
	},
	offlineSupport: ['app'],
	webAppManifest: {
		app: {
			name: 'Game Jolt',
			short_name: 'Game Jolt',
			description: 'Games for the love of it!',
			background_color: '#191919',
			theme_color: '#191919',
			display: 'standalone',
			start_url: './?utm_source=web_app_manifest',
			icons: [
				{
					src: 'icon-128x128.png',
					size: 128,
				},
				{
					src: 'icon-144x144.png',
					size: 144,
				},
				{
					src: 'chrome-touch-icon-192x192.png',
					size: 192,
				},
			],
		},
	},
};

require('./src/lib/gj-lib-client/gulp/tasks/common')(config, __dirname);

// For releasing to S3.
// We have to gather all the builds into the versioned folder before pushing.
const packageJson = require('./package.json');
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
