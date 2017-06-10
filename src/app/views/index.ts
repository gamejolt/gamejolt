import Vue from 'vue';
import VueRouter from 'vue-router';
import Component from 'vue-class-component';

import { Ruler } from '../../lib/gj-lib-client/components/ruler/ruler-service';
import { Autoscroll } from '../../lib/gj-lib-client/components/scroll/auto-scroll/autoscroll.service';
import { Scroll } from '../../lib/gj-lib-client/components/scroll/scroll.service';

import { routeDiscover } from './discover/discover.route';
import { routeFallbacks } from './fallback.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { routeSearch } from './search/search.route';
import { routeProfile } from './profile/profile.route';
import { routeError404, RouteError404 } from '../../lib/gj-lib-client/components/error/page/page.route';
import { routeActivity } from './activity/activity.route';
import { routeLibrary } from './library/library.route';
import { routeSettings } from './settings/settings.route';
import { routeForums } from './forums/forums.route';
import { routeRadio } from './radio/radio.route';
import { routeDash } from './dashboard/dashboard.route';

Vue.use( VueRouter );

Component.registerHooks( [
	'beforeRouteEnter',
	'beforeRouteUpdate',
	'beforeRouteLeave'
] );

const routes = [
	routeDiscover,
	routeActivity,
	routeSearch,
	routeProfile,
	routeLibrary,
	routeSettings,
	routeLanding,
	routeForums,
	routeRadio,
	routeLegal,
	routeDash,
	...routeFallbacks,
	routeError404,
];

// Should tell the browser that we want to handle our own scrolling.
if ( 'scrollRestoration' in history ) {
	history.scrollRestoration = 'manual';
}

// let prevAnchor: HTMLElement | undefined;

export const router = new VueRouter( {
	mode: !GJ_IS_CLIENT ? 'history' : undefined,
	routes,
	scrollBehavior( to, from, savedPosition )
	{
		Autoscroll.routeChange( to, from );

		// Skip one auto scroll trigger.
		if ( !Scroll.shouldAutoScroll ) {
			Scroll.shouldAutoScroll = true;
			return undefined;
		}

		if ( to.meta.noAutoScroll ) {
			return undefined;
		}

		if ( savedPosition ) {
			return savedPosition;
		}

		// const anchor = Scroll.autoscrollAnchor;

		// if ( anchor && anchor === prevAnchor ) {

		// 	console.log( 'same anchor', anchor );

		// 	// We only scroll to the anchor if they're scrolled past it currently.
		// 	const offset = Ruler.offset( anchor );
		// 	console.log( offset.top, Scroll.getScrollTop(), Scroll.offsetTop );
		// 	if ( Scroll.getScrollTop() > offset.top - Scroll.offsetTop ) {
		// 		console.log( 'whaaaaaat' );
		// 		return {
		// 			x: 0,
		// 			y: offset.top,
		// 		};
		// 	}

		// 	return undefined;
		// }

		// prevAnchor = anchor;

		const position: any = {
			x: 0,
			y: 0,
		};

		if ( to.hash ) {
			position.selector = to.hash;
		}

		return position;
	}
} );

if ( !GJ_IS_SSR ) {
	// document.body.addEventListener( 'click', ( e ) =>
	// {
	// 	let target: HTMLAnchorElement;
	// 	if ( !(e.target instanceof HTMLElement) ) {
	// 		console.log( 'not html element' );
	// 		return;
	// 	}

	// 	target = e.target as HTMLAnchorElement;
	// 	console.log( 'target', target );
	// 	// 	while (nodeName_(elm[0]) !== 'a') {
	// 	//     // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
	// 	//     if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
	// 	//   }

	// 	while ( target.nodeName.toLowerCase() !== 'a' ) {
	// 		if ( target as any === document || !target.parentNode ) {
	// 			return;
	// 		}
	// 		target = target.parentNode as HTMLAnchorElement;
	// 	}

	// 	// while ( parent.nodeName !== 'a' && parent !== document.body ) {
	// 	// 	parent = target;
	// 	// }

	// 	// if ( parent === document.body ) {
	// 	// 	console.log( 'not found' );
	// 	// 	return;
	// 	// }

	// 	let href = target.href;
	// 	if ( !href ) {
	// 		return;
	// 	}

	// 	if ( href.indexOf( window.location.origin ) === 0 ) {
	// 		href = href.replace( window.location.origin, '' );
	// 	}
	// 	console.log( href );

	// 	const matched = router.getMatchedComponents( href );
	// 	console.log( 'matched', matched );

	// 	if ( matched.length === 1 && matched[0] === RouteError404 ) {
	// 		console.log( 'skip because 404' );
	// 		return;
	// 	}

	// 	if ( matched ) {
	// 		e.preventDefault();
	// 		e.stopPropagation();
	// 		e.stopImmediatePropagation();
	// 		router.push( href );
	// 	}
	// } );
}
