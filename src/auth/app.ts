import { bootstrap } from 'ng-metadata/platform';
import { enableProdMode, provide } from 'ng-metadata/core';

import ConnectionModule from './../lib/gj-lib-client/components/connection/connection';
import ConnectionStatePermissionsModule from './../lib/gj-lib-client/components/connection/state-permissions/state-permissions';
import ModelModule from './../lib/gj-lib-client/components/model/model';
import MetaModule from './../lib/gj-lib-client/components/meta/meta';
import RulerModule from './../lib/gj-lib-client/components/ruler/ruler';
import ScreenModule from './../lib/gj-lib-client/components/screen/screen';
import ImgHelperModule from './../lib/gj-lib-client/components/img/helper/helper';
import PopoverModule from '../lib/gj-lib-client/components/popover/popover';
import AuthModule from '../lib/gj-lib-client/components/auth/auth';
import AuthJoinModule from '../lib/gj-lib-client/components/auth/join/join';
import AuthLoginModule from '../lib/gj-lib-client/components/auth/login/login';

import { AppCtrl } from './app-controller';
import { App } from './app-service';

if ( GJ_BUILD_TYPE == 'production' ) {
	enableProdMode();
}

const AppModule = angular.module( 'App', [
	// Set the event tracking up first.
	'gj.ErrorTracking',

	ConnectionStatePermissionsModule,

	// Client.
	/* inject client:base:modules */

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
	ModelModule,
	MetaModule,
	'gj.Error',

	'gj.Debug',
	'gj.Debug.DebugBar',
	RulerModule,
	ScreenModule,
	'gj.BodyClasses',
	'gj.Analytics',
	'gj.Loading',
	'gj.Loading.LoadingPageTransition',
	'gj.Scroll',
	ConnectionModule,
	'gj.ExpandWhen',

	'gj.Tooltip',
	PopoverModule,
	'gj.Growls',
	'gj.History',
	'gj.Scroll.AutoScroll',

	'gj.Form',
	'gj.Progress.Poller',

	'gj.User',
	'gj.User.LinkedAccounts',
	'gj.MediaItem',

	ImgHelperModule,

	'App.Forms',

	'App.CoverImg',

	AuthModule,
	AuthJoinModule,
	AuthLoginModule,

	// Views.
	'App.Views',
] )
.config( function(
	$locationProvider: ng.ILocationProvider,
	$uiViewScrollProvider: ng.ui.IUiViewScrollProvider,
	$compileProvider: ng.ICompileProvider,
	EnvironmentProvider: any,
	$sceDelegateProvider: ng.ISCEDelegateProvider,
	TranslateProvider: any,
)
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://b6d3e9q9.ssl.hwcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	if ( GJ_ENVIRONMENT == 'development' ) {
		EnvironmentProvider.env = 'development';
	}

	if ( GJ_BUILD_TYPE == 'development' ) {
		EnvironmentProvider.buildType = 'development';
	}

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
			'en_AU': '/translations/en_AU/auth.json',
			'nl': '/translations/nl/auth.json',
			'ro': '/translations/ro/auth.json',
			'de': '/translations/de/auth.json',
			'es': '/translations/es/auth.json',
			'fr': '/translations/fr/auth.json',
			'ru': '/translations/ru/auth.json',
			'sv': '/translations/sv/auth.json',
			'tr': '/translations/tr/auth.json',
			'pt': '/translations/pt/auth.json',
			'pt_BR': '/translations/pt_BR/auth.json',
			'fi': '/translations/fi/auth.json',
			'nb': '/translations/nb/auth.json',
			'el': '/translations/el/auth.json',
			'ms': '/translations/ms/auth.json',
			'pl': '/translations/pl/auth.json',
			'uk': '/translations/uk/auth.json',
			'it': '/translations/it/auth.json',
			'bg': '/translations/bg/auth.json',
			'cs': '/translations/cs/auth.json',
			'es_419': '/translations/es_419/auth.json',
			'es_AR': '/translations/es_AR/auth.json',
			'es_CO': '/translations/es_CO/auth.json',
			'es_MX': '/translations/es_MX/auth.json',
			'hr': '/translations/hr/auth.json',
			'id': '/translations/id/auth.json',
			'zh_TW': '/translations/zh_TW/auth.json',
		},
	};

	TranslateProvider.addLanguageUrls( languages );
} )
.name;

angular.module( AppModule )
.controller( 'AppCtrl', AppCtrl )
.service( ...provide( 'App', { useClass: App } ) );

setTimeout( function()
{
	bootstrap( AppModule );
}, 0 );
