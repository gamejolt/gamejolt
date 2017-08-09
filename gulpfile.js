var gulp = require('gulp');

var config = {
	staticCdn: 'https://b6d3e9q9.ssl.hwcdn.net',
	injectVersion: 2,
	framework: 'vue',
	sections: ['auth', 'checkout', 'claim'],
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

require('./src/lib/gj-lib-client/gulp/tasks/common.js')(config, __dirname);
require('./tasks/client.js')(config);
require('./tasks/app.js')(config);
require('./tasks/terms.js')(config);
require('./tasks/game-api-doc.js')(config);

gulp.task('pre', gulp.parallel('terms', 'game-api-doc:nav', 'game-api-doc:compile'));
