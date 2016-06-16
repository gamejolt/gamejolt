import 'reflect-metadata';
import { bootstrap } from 'ng-metadata/platform';

import './views/views';
import './components/forms/forms';

import { AppCtrl } from './app-controller';
import { App } from './app-service';

import ModelModule from './../lib/gj-lib-client/components/model/model';
import RulerModule from './../lib/gj-lib-client/components/ruler/ruler';

angular.module( 'App', [
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
	'gj.Error',
	'gj.Translate',
	'gj.Geo',

	'gj.Debug',
	'gj.Debug.DebugBar',
	RulerModule,
	'gj.Screen',
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

	'gj.Img.Helper',
	'gj.Img.ImgResponsive',

	'gj.SiteSelector',

	'gj.Game',
	'gj.MediaItem',

	'gj.User',
	'gj.User.UserBar',
	'gj.User.UserAvatar',

	'gj.Sellable',
	'gj.Sellable.Pricing',

	'gj.Popover',

	'App.Forms',

	// Views.
	'App.Views',

	// Client.
	/* inject client:base:modules */
] )
.service( 'App', App )
.controller( 'AppCtrl', AppCtrl )
.config( function( $locationProvider, $uiViewScrollProvider, $compileProvider, $httpProvider, EnvironmentProvider, $sceDelegateProvider )
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
} )
;

setTimeout( function()
{
	bootstrap( 'App' );
}, 0 );
