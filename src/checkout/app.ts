import { bootstrap } from 'ng-metadata/platform';
import { enableProdMode, provide } from 'ng-metadata/core';

import { isClient } from '../lib/gj-lib-client/components/environment/environment.service';

import EnvironmentModule from '../lib/gj-lib-client/components/environment/environment';
import ModelModule from './../lib/gj-lib-client/components/model/model';
import MetaModule from './../lib/gj-lib-client/components/meta/meta';
import RulerModule from './../lib/gj-lib-client/components/ruler/ruler';
import ScreenModule from './../lib/gj-lib-client/components/screen/screen';
import ImgHelperModule from './../lib/gj-lib-client/components/img/helper/helper';
import ImgResponsiveModule from './../lib/gj-lib-client/components/img/responsive/responsive';
import PopoverModule from '../lib/gj-lib-client/components/popover/popover';

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
	EnvironmentModule,
	'gj.Api',
	'gj.Payload',
	ModelModule,
	MetaModule,
	'gj.Error',
	'gj.Translate',
	'gj.Geo',

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

	PopoverModule,

	FormsModule,

	// Views.
	ViewsModule,
] )
.config( function(
	$locationProvider: ng.ILocationProvider,
	$uiViewScrollProvider: ng.ui.IUiViewScrollProvider,
	$compileProvider: ng.ICompileProvider,
	$sceDelegateProvider: ng.ISCEDelegateProvider,
)
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://s.gjcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	// Desktop client.
	if ( isClient ) {

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
