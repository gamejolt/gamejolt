// import 'rxjs/Rx';
// import { UpgradeAdapter } from '@angular/upgrade';

// // import { bootstrap } from '@angular/platform-browser-dynamic';
// import { Component, Input, OnInit } from '@angular/core';

// const upgradeAdapter = new UpgradeAdapter();

// @Component({
// 	selector: 'gj-meter',
// 	template: `
// 	<div class="meter"
// 		[class.big]="isBig"
// 		[class.meter-low]="level <= 5"
// 		[class.meter-mid]="level > 5 && level < 8"
// 		[class.meter-high]="level >= 8"
// 		>

// 		<div class="meter-blip"
// 			*ngFor="let i of [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]"
// 			[class.meter-blip-filled]="level >= i - 0.1"
// 			>
// 		</div>

// 		<!--
// 			Since the last bar is special cased to 9.5 instead of 10.
// 		-->
// 		<div class="meter-blip" [class.meter-blip-filled]="level >= 9.5"></div>

// 	</div>
// 	`,
// })
// class MeterComponent implements OnInit
// {
// 	@Input( 'meterRating' ) rating: number;
// 	@Input( 'meterIsBig' ) isBig: boolean;

// 	level: number;

// 	ngOnInit()
// 	{
// 		console.log( 'yo' );
// 		this.level = (this.rating || 0) * 2;
// 	}
// }

// ///////

import viewsMod from './views/views';
import formsMod from './components/forms/forms';

import { AppCtrl } from './app-controller';
import { App } from './app-service';

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
	'gj.Model',
	'gj.Error',
	'gj.Translate',
	'gj.Geo',

	'gj.Debug',
	'gj.Debug.DebugBar',
	'gj.Ruler',
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

	formsMod,

	// Views.
	viewsMod,

	// Client.
	/* inject client:base:modules */
] )
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
.service( 'App', App )
.controller( 'AppCtrl', AppCtrl )
// .directive( 'yoMeter', <angular.IDirectiveFactory>upgradeAdapter.downgradeNg2Component( MeterComponent ) );
;

setTimeout( function()
{
	// upgradeAdapter.bootstrap( document, [ 'App' ] );
	angular.bootstrap( document, [ 'App' ] );
}, 0 );
