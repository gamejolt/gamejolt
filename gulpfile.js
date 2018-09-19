const gulp = require('gulp');
const shell = require('gulp-shell');
const path = require('path');

const config = {
	staticCdn: 'https://s.gjcdn.net',
	injectVersion: 2,
	sections: {
		app: {
			title: 'Game Jolt - Indie games for the love of it',
			server: true,
			client: true,
			offline: true,
			webAppManifest: {
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
		auth: {
			title: 'Game Jolt - Indie games for the love of it',
			server: true,
			client: true,
			bodyClass: 'fill-darkest',
		},
		checkout: {
			title: 'Checkout - Game Jolt',
			client: true,
			crawl: false,
			scripts: '<script type="text/javascript" src="https://js.stripe.com/v2/"></script>',
		},
		claim: {
			title: 'Claim - Game Jolt',
			crawl: false,
		},
		'site-editor': {
			title: 'Edit Site - Game Jolt',
			crawl: false,
		},
		gameserver: {
			title: 'Playing Game - Game Jolt',
			crawl: false,
		},
		client: {
			title: 'Game Jolt',
			client: true,
			crawl: false,
			bodyClass: 'fill-darkest',
		},
	},
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
};

require('game-jolt-frontend-lib/gulp/tasks/common')(config, __dirname);
