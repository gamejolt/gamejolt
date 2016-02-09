var config = {
	staticCdn: 'https://b6d3e9q9.ssl.hwcdn.net',
	extraBower: {
		'angular-bootstrap': [
			'src/transition/transition.js',
			'src/position/position.js',
			'src/bindHtml/bindHtml.js',
			'src/tooltip/tooltip.js',
			'src/collapse/collapse.js',
			'src/modal/modal.js'
		],
		'codemirror': [
			'addon/mode/overlay.js',
			'addon/display/placeholder.js',
			'mode/markdown/markdown.js',
			'mode/gfm/gfm.js'
		],
	},
	modules: {
		'vendor-app.js': {
			bower: [
				'moment',
				'humanize-duration',
				// 'ui-router-extras',
				'angular-moment',
				'angular-hotkeys',
				'ocLazyLoad',
				'angular-ui-utils',
				'favico.js',
				'angular-inview',
			]
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
		'codemirror.js': {
			bower: [
				'codemirror',
				'angular-ui-codemirror',
			],
		},
		'ua-parser.js': {
			bower: [
				'ua-parser-js',
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
			components: [
				'forms/dashboard',
			],
			// views: [
			// 	'dashboard',
			// ]
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

		// For client auth section.
		'client-auth.js': {
			components: [
				'client-auth',
			]
		}
	},
	sections: [
		'auth'
	],
	translations: 'site-translations',
	translationSections: [
		'auth',
		'dash'
	],
};

require( './src/lib/gj-lib-client/gulp/tasks/common.js' )( config );
require( './tasks/client.js' )( config );
require( './tasks/app.js' )( config );
