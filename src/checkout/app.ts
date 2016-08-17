import { bootstrap } from 'ng-metadata/platform';
import { enableProdMode, provide } from 'ng-metadata/core';

import ModelModule from './../lib/gj-lib-client/components/model/model';
import MetaModule from './../lib/gj-lib-client/components/meta/meta';
import RulerModule from './../lib/gj-lib-client/components/ruler/ruler';
import ScreenModule from './../lib/gj-lib-client/components/screen/screen';
import ImgHelperModule from './../lib/gj-lib-client/components/img/helper/helper';
import ImgResponsiveModule from './../lib/gj-lib-client/components/img/responsive/responsive';

import { AppCtrl } from './app-controller';
import { App } from './app-service';
import FormsModule from './components/forms/forms';
import ViewsModule from './views/views';

if ( GJ_BUILD_TYPE == 'production' ) {
	enableProdMode();
}

const AppModule = angular.module( 'App', [
	// Client.
	/* inject client:base:modules */

	// Libs.
	'ngSanitize',
	'ngAnimate',
	'ui.router',
	'chieffancypants.loadingBar',
	'ui.bootstrap.collapse',
	'ui.bootstrap.modal',
	'ui.bootstrap.position',
	'credit-cards',
	'ui.mask',

	// GJ lib.
	'gj.Environment',
	'gj.Api',
	'gj.Payload',
	ModelModule,
	MetaModule,
	'gj.Error',
	'gj.Translate',
	'gj.Geo',

	'gj.Debug',
	'gj.Debug.DebugBar',
	RulerModule,
	ScreenModule,
	'gj.BodyClasses',
	'gj.Analytics',
	'gj.Loading',
	'gj.Loading.LoadingPageTransition',
	'gj.Scroll',
	'gj.Scroll.AutoScroll',
	'gj.ExpandWhen',
	'gj.Form',
	'gj.Registry',
	'gj.History',
	'gj.Growls',
	'gj.Tooltip',

	ImgHelperModule,
	ImgResponsiveModule,

	'gj.SiteSelector',

	'gj.Game',
	'gj.MediaItem',

	'gj.User',
	'gj.User.UserBar',
	'gj.User.UserAvatar',

	'gj.Sellable',
	'gj.Sellable.Pricing',

	'gj.Popover',

	FormsModule,

	// Views.
	ViewsModule,
] )
.config( function(
	$locationProvider: ng.ILocationProvider,
	$uiViewScrollProvider: ng.ui.IUiViewScrollProvider,
	$compileProvider: ng.ICompileProvider,
	EnvironmentProvider: any,
	$sceDelegateProvider: ng.ISCEDelegateProvider,
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
} )
.name;

angular.module( AppModule )
.controller( 'AppCtrl', AppCtrl )
.service( ...provide( 'App', { useClass: App } ) );

setTimeout( function()
{
	bootstrap( AppModule );
}, 0 );
