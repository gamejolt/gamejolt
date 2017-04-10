import Vue from 'vue';
import VueRouter from 'vue-router';

import { routeDiscover } from './discover/discover.route';
import { routeFallbacks } from './fallback.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { Scroll } from '../../lib/gj-lib-client/components/scroll/scroll.service';
import { routeSearch } from './search/search.route';
import { routeProfile } from './profile/profile.route';
import { routeError404 } from '../../lib/gj-lib-client/components/error/page/page.route';
import { routeActivity } from './activity/activity.route';
import { routeLibrary } from './library/library.route';
import { routeSettings } from './settings/settings.route';
import { routeForums } from './forums/forums.route';

Vue.use( VueRouter );

const routes = [
	routeDiscover,
	routeActivity,
	routeSearch,
	routeProfile,
	routeLibrary,
	routeSettings,
	routeLanding,
	routeForums,
	routeLegal,
	...routeFallbacks,
	routeError404,
];

// Should tell the browser that we want to handle our own scrolling.
if ( 'scrollRestoration' in history ) {
	history.scrollRestoration = 'manual';
}

export const router = new VueRouter( {
	mode: 'history',
	routes,
	scrollBehavior( to, _from, savedPosition )
	{
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
