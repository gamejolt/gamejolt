angular.module( 'App', [
	// Set the event tracking up first.
	'gj.ErrorTracking',

	// Libs.
	'ngSanitize',
	'ngAnimate',
	'ui.router',

	'ui.bootstrap.collapse',

	// GJ lib.
	'gj.Translate',
	'gj.Translate.LangSelector',
	'gj.Environment',
	'gj.Api',
	'gj.Payload',
	'gj.Model',
	'gj.Error',

	'gj.Debug',
	'gj.Debug.DebugBar',
	'gj.Ruler',
	'gj.Screen',
	'gj.BodyClasses',
	'gj.Analytics',
	'gj.Loading',
	'gj.Loading.LoadingPageTransition',
	'gj.Scroll',
	'gj.Connection',
	'gj.ExpandWhen',

	'gj.Tooltip',
	'gj.Popover',
	'gj.Growls',
	'gj.Scroll.AutoScroll',

	'gj.Form',
	'gj.Progress.Poller',

	'gj.User',
	'gj.User.LinkedAccounts',
	'gj.MediaItem',

	'gj.Img.Helper',

	'App.Forms',

	'App.CoverImg',

	// Views.
	'App.Views',

	// Client.
	/* inject client:auth:modules */
] )
.config( function( $locationProvider, $uiViewScrollProvider, $compileProvider, $httpProvider, EnvironmentProvider, $sceDelegateProvider, TranslateProvider )
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://b6d3e9q9.ssl.hwcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	$compileProvider.debugInfoEnabled( false );
	$httpProvider.useApplyAsync( true );

	// We are on WTTF!
	EnvironmentProvider.isWttf = true;

	// Desktop client.
	if ( EnvironmentProvider.isClient ) {

		// Some libraries attach onto global instead of window for node-webkit
		// because they think they're in nodejs context. Just pull back over to window.
		if ( typeof window._ == 'undefined' ) {
			window._ = global._;
		}

		if ( typeof window.moment == 'undefined' ) {
			window.moment = global.moment;
		}

		// Can't use push/popstate URLs for node-webkit.
		// Must be accessed like a local file with index.html at the root.
		$locationProvider.html5Mode( false );

		// Since we're using the "app://" protocol, we have to change the sanitization whitelist
		// to include the app protocol as well. Otherwise we get "unsafe:" prefixed onto certain URLs.
		$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|app):/ );
		$compileProvider.imgSrcSanitizationWhitelist( /^\s*((https?|ftp|file|blob|app):|data:image\/)/ );
	}

	// Can't include in a foreach. Have to list out so that the revisioner for filenames will pull it.
	var languages = {
		auth: {
			'en': '/translations/en/auth.json',
			'en_US': '/translations/en_US/auth.json',
			'nl': '/translations/nl/auth.json',
			'ro': '/translations/ro/auth.json',
			'de': '/translations/de/auth.json',
			'es': '/translations/es/auth.json',
			'fr': '/translations/fr/auth.json',
			'ru': '/translations/ru/auth.json',
			'sv': '/translations/sv/auth.json',
			'tr': '/translations/tr/auth.json',
			'pt_BR': '/translations/pt_BR/auth.json',
			'fi': '/translations/fi/auth.json',
			'nb': '/translations/nb/auth.json',
		},
	};

	TranslateProvider.addLanguageUrls( languages );
} );
