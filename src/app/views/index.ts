import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeDiscover } from './discover/discover.route';
import { routeFallbacks } from './fallback.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { routeSearch } from './search/search.route';
import { routeProfile } from './profile/profile.route';
import { routeActivity } from './activity/activity.route';
import { routeLibrary } from './library/library.route';
import { routeSettings } from './settings/settings.route';
import { routeForums } from './forums/forums.route';
import { routeRadio } from './radio/radio.route';
import { routeDash } from './dashboard/dashboard.route';

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
];

export const router = initRouter(routes);

if (!GJ_IS_SSR) {
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
