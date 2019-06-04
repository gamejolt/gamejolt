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
			crawl: true,
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
			crawl: true,
			bodyClass: 'fill-darkest',
		},
		checkout: {
			title: 'Checkout - Game Jolt',
			client: true,
			scripts: '<script type="text/javascript" src="https://js.stripe.com/v2/"></script>',
		},
		claim: {
			title: 'Claim - Game Jolt',
		},
		'site-editor': {
			title: 'Edit Site - Game Jolt',
		},
		gameserver: {
			title: 'Playing Game - Game Jolt',
		},
		client: {
			title: 'Game Jolt',
			client: true,
			bodyClass: 'fill-darkest',
		},
		playbox: {
			title: 'Playbox - for tests and stuff',
			server: true,
			crawl: true,
		},
		z: {
			title: 'Game Jolt - Indie games for the love of it',
			bodyClass: 'main-body',
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
		playbox: ['playbox/'],
	},
};

require('game-jolt-frontend-lib/gulp/tasks/common')(config, __dirname);
