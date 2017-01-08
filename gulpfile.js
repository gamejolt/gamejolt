var gulp = require( 'gulp' );

var config = {
	staticCdn: 'https://s.gjcdn.net',
	injectVersion: 2,
	extraBower: {
		'angular-bootstrap': [
			'src/transition/transition.js',
			'src/position/position.js',
			'src/bindHtml/bindHtml.js',
			'src/tooltip/tooltip.js',
			'src/collapse/collapse.js',
			'src/modal/modal.js',
			'src/dateparser/dateparser.js',
			'src/datepicker/datepicker.js',
			'src/timepicker/timepicker.js',
		],
	},
	rollup: {
		vendor: {
			'ng-metadata/core': 'vendor.ngMetadata_core',
			'ng-metadata/platform': 'vendor.ngMetadata_platform',
		},
	},
	modules: {
		'vendor-app.js': {
			bower: [
				'moment',
				'humanize-duration',
				'angular-moment',
				'angular-hotkeys',
				'ocLazyLoad',
				'angular-ui-utils',
				'favico.js',
				'angular-inview',
				'angular-elastic',
				'ua-parser-js',
			]
		},
		'vendor-checkout.js': {
			bower: [
				'angular-credit-cards',
				'angular-ui-mask',
			],
		},
		'jquery.js': {
			bower: [
				'jquery',
			]
		},
		'hammer.js': {
			bower: [
				'hammerjs',
				'angular-hammer',
			],
		},
		'jcrop.js': {
			bower: [
				'jcrop',
			],
		},
		'graphs.js': {
			bower: [
				'Chart.js',
				'tc-angular-chartjs',
			],
		},
		'upload.js': {
			bower: [
				'ng-file-upload',
			],
		},
		'ui-tree.js': {
			bower: [
				'angular-ui-tree',
			],
		},
		'chat.js': {
			components: [
				'chat',
			],
		},
		'primus.js': {
			componentVendor: [
				'primus',
			],
		},
		'error-tracking.js': {
			componentVendor: [
				'error-tracking',
			],
		},

		// Sections of the site.
		'dash.js': {
			main: '/views/dashboard/dashboard.ts',
			components: [
				'forms/dashboard',
				'site-analytics',
			],
			libComponents: [
				'timezone',
			],
			views: [
				'dashboard',
			],
			bower: [
				'moment-timezone',
				'ngTimezone',
			]
		},
		'forums.js': {
			components: [
				'forms/forum',
				'forum',
			],
			views: [
				'forums',
			]
		},
		'channels.js': {
			main: '/views/discover/channels/channels.ts',
			views: [
				'discover/channels',
			]
		},
		'radio.js': {
			main: '/views/radio/radio.ts',
			views: [
				'radio',
			]
		},

		// For client.
		'client.js': {
			bower: [
				'dexie',
			],
			components: [
				'client',
			],
		},

		'client-updater.js': {
			components: [
				'client-updater',
			],
		},

		// For client sections.
		'client-base.js': {
			components: [
				'client-base',
			]
		}
	},
	sections: [
		'auth',
		'checkout',
	],
	translations: 'site-translations',
	translationSections: {
		auth: [
			'auth/',
		],
		dash: [
			'app/components/forms/dashboard',
			'app/components/forms/site\-analytics',
			'app/views/dashboard',
		],
		checkout: [
			'checkout/',
		],
	},
};

require( './src/lib/gj-lib-client/gulp/tasks/common.js' )( config );
require( './tasks/client.js' )( config );
require( './tasks/app.js' )( config );
require( './tasks/terms.js' )( config );
require( './tasks/game-api-doc.js' )( config );

gulp.task( 'pre', gulp.parallel( 'terms', 'game-api-doc:nav', 'game-api-doc:compile' ) );
