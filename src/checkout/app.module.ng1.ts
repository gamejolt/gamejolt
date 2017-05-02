import * as angular from 'angular';

import { bootstrapFacade } from '../lib/gj-lib-client/utils/angular-facade';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Referrer } from '../lib/gj-lib-client/components/referrer/referrer.service';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';

import '../lib/gj-lib-client/components/body-classes/body-classes';
import '../lib/gj-lib-client/components/loading/loading';
import '../lib/gj-lib-client/components/scroll/auto-scroll/auto-scroll';
import '../lib/gj-lib-client/components/expand-when/expand-when.module';
import '../lib/gj-lib-client/components/form/form';
import '../lib/gj-lib-client/components/tooltip/tooltip.module';
import '../lib/gj-lib-client/components/site-selector/site-selector';

export const AppModuleNg1 = angular.module( 'App', [

	// Client.
	/* inject client:base:modules */

	// Libs.
	'ngSanitize',
	'ngAnimate',

	'ui.bootstrap.collapse',
	'ui.bootstrap.modal',
	'credit-cards',
	'ui.mask',

	'gj.BodyClasses',
	'gj.Loading',
	'gj.Scroll.AutoScroll',
	'gj.ExpandWhen',
	'gj.Form',
	'gj.Tooltip',
	'gj.SiteSelector',
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
	};

	Translate.addLanguageUrls( languages );
} )
/*@ngInject*/
.run( (
	$q: ng.IQService,
	$animate: ng.animate.IAnimateService,
	$rootScope: ng.IRootScopeService,
	gettextCatalog: ng.gettext.gettextCatalog,
) =>
{
	bootstrapFacade( $q, $animate );
	gettextCatalog.setCurrentLanguage( Translate.lang );
	Analytics.initAngular( $rootScope );
	Meta.initAngular( $rootScope );
	Referrer.initAngular( $rootScope );
} )
.name;
