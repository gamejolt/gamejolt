import Vue from 'vue';
import VueRouter from 'vue-router';

import { routeDiscover } from './discover/discover.route';
import { routeFallbacks } from './fallback.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { Scroll } from '../../lib/gj-lib-client/components/scroll/scroll.service';
import { routeSearch } from './search/search.route';
import { routeProfile } from './profile/profile.route';

Vue.use( VueRouter );

const routes = [
	routeDiscover,
	routeSearch,
	routeProfile,
	routeLanding,
	routeLegal,
	...routeFallbacks,
	// {
	// 	path: '*',
	// 	component: () => asyncComponentLoader( $import( './fallback' ) ),
	// },
];

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
