import * as angular from 'angular';
import { TransitionService } from 'angular-ui-router';

import { bootstrapFacade } from '../lib/gj-lib-client/utils/angular-facade';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app-service';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';

import '../lib/gj-lib-client/components/error/error-module';
import '../lib/gj-lib-client/components/body-classes/body-classes';
import '../lib/gj-lib-client/components/loading/loading';
import '../lib/gj-lib-client/components/scroll/auto-scroll/auto-scroll';
import '../lib/gj-lib-client/components/expand-when/expand-when';
import '../lib/gj-lib-client/components/tooltip/tooltip.module';
import '../lib/gj-lib-client/components/growls/growls';
import '../lib/gj-lib-client/components/history/history';
import '../lib/gj-lib-client/components/form/form';
import '../lib/gj-lib-client/components/progress/poller/poller';
import '../lib/gj-lib-client/components/user/linked-accounts/linked-accounts';

export const AppModuleNg1 = angular.module( 'App', [

	// Set the event tracking up first.
	// 'gj.ErrorTracking',

	// Client.
	/* inject client:base:modules */

	// Libs.
	'ngSanitize',
	'ngAnimate',

	'ui.bootstrap.collapse',

	// GJ lib.
	'gj.Error',

	'gj.BodyClasses',
	'gj.Loading',
	'gj.ExpandWhen',

	'gj.Tooltip',
	'gj.Growls',
	'gj.History',
	'gj.Scroll.AutoScroll',

	'gj.Form',
	'gj.Progress.Poller',

	'gj.User.LinkedAccounts',
] )
/*@ngInject*/
.config( (
	$locationProvider: ng.ILocationProvider,
	$uiViewScrollProvider: any,
	$compileProvider: ng.ICompileProvider,
	$sceDelegateProvider: ng.ISCEDelegateProvider,
) =>
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://s.gjcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	// Desktop client.
	if ( GJ_IS_CLIENT ) {

		// // Some libraries attach onto global instead of window for node-webkit
		// // because they think they're in nodejs context. Just pull back over to window.
		// if ( typeof window._ == 'undefined' ) {
		// 	window._ = (<any>global)._;
		// }

		// Can't use push/popstate URLs for node-webkit.
		// Must be accessed like a local file with index.html at the root.
		$locationProvider.html5Mode( false );

		// Since we're using the "app://" protocol, we have to change the sanitization whitelist
		// to include the app protocol as well. Otherwise we get "unsafe:" prefixed onto certain URLs.
		$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|app):/ );
		$compileProvider.imgSrcSanitizationWhitelist( /^\s*((https?|ftp|file|blob|app):|data:image\/)/ );
	}

	// Can't include in a foreach. Have to list out so that the revisioner for filenames will pull it.
	const languages = {
		main: {
			'en': require( '../translations/en/main.json' ),
			'en_US': require( '../translations/en_US/main.json' ),
			'en_AU': require( '../translations/en_AU/main.json' ),
			'nl': require( '../translations/nl/main.json' ),
			'ro': require( '../translations/ro/main.json' ),
			'de': require( '../translations/de/main.json' ),
			'es': require( '../translations/es/main.json' ),
			'fr': require( '../translations/fr/main.json' ),
			'ru': require( '../translations/ru/main.json' ),
			'sv': require( '../translations/sv/main.json' ),
			'tr': require( '../translations/tr/main.json' ),
			'pt': require( '../translations/pt/main.json' ),
			'pt_BR': require( '../translations/pt_BR/main.json' ),
			'fi': require( '../translations/fi/main.json' ),
			'nb': require( '../translations/nb/main.json' ),
			'el': require( '../translations/el/main.json' ),
			'ms': require( '../translations/ms/main.json' ),
			'pl': require( '../translations/pl/main.json' ),
			'uk': require( '../translations/uk/main.json' ),
			'it': require( '../translations/it/main.json' ),
			'bg': require( '../translations/bg/main.json' ),
			'cs': require( '../translations/cs/main.json' ),
			'es_419': require( '../translations/es_419/main.json' ),
			'es_AR': require( '../translations/es_AR/main.json' ),
			'es_CO': require( '../translations/es_CO/main.json' ),
			'es_MX': require( '../translations/es_MX/main.json' ),
			'hr': require( '../translations/hr/main.json' ),
			'id': require( '../translations/id/main.json' ),
			'zh_TW': require( '../translations/zh_TW/main.json' ),
		},
		auth: {
			'en': require( '../translations/en/auth.json' ),
			'en_US': require( '../translations/en_US/auth.json' ),
			'en_AU': require( '../translations/en_AU/auth.json' ),
			'nl': require( '../translations/nl/auth.json' ),
			'ro': require( '../translations/ro/auth.json' ),
			'de': require( '../translations/de/auth.json' ),
			'es': require( '../translations/es/auth.json' ),
			'fr': require( '../translations/fr/auth.json' ),
			'ru': require( '../translations/ru/auth.json' ),
			'sv': require( '../translations/sv/auth.json' ),
			'tr': require( '../translations/tr/auth.json' ),
			'pt': require( '../translations/pt/auth.json' ),
			'pt_BR': require( '../translations/pt_BR/auth.json' ),
			'fi': require( '../translations/fi/auth.json' ),
			'nb': require( '../translations/nb/auth.json' ),
			'el': require( '../translations/el/auth.json' ),
			'ms': require( '../translations/ms/auth.json' ),
			'pl': require( '../translations/pl/auth.json' ),
			'uk': require( '../translations/uk/auth.json' ),
			'it': require( '../translations/it/auth.json' ),
			'bg': require( '../translations/bg/auth.json' ),
			'cs': require( '../translations/cs/auth.json' ),
			'es_419': require( '../translations/es_419/auth.json' ),
			'es_AR': require( '../translations/es_AR/auth.json' ),
			'es_CO': require( '../translations/es_CO/auth.json' ),
			'es_MX': require( '../translations/es_MX/auth.json' ),
			'hr': require( '../translations/hr/auth.json' ),
			'id': require( '../translations/id/auth.json' ),
			'zh_TW': require( '../translations/zh_TW/auth.json' ),
		},
	};

	Translate.addLanguageUrls( languages );
} )
/*@ngInject*/
.run( (
	$q: ng.IQService,
	$animate: ng.animate.IAnimateService,
	$transitions: TransitionService,
	$rootScope: ng.IRootScopeService,
	gettextCatalog: ng.gettext.gettextCatalog,
	App: App,
) =>
{
	bootstrapFacade( $q, $animate );
	gettextCatalog.setCurrentLanguage( Translate.lang );
	Payload.initAngular( App, $transitions );
	Analytics.initAngular( $rootScope );
	Meta.initAngular( $rootScope );
	Connection.initAngular( $rootScope );
} )
.name;
