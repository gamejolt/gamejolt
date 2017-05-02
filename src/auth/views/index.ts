import Vue from 'vue';
import VueRouter from 'vue-router';
import { routeAuth } from './auth/auth.route';
import { store } from '../store/index';

Vue.use( VueRouter );

const routes = [
	routeAuth,
];

export const router = new VueRouter( {
	mode: !GJ_IS_CLIENT ? 'history' : undefined,
	routes,
} );

// Check the meta info to hide/show cover images.
router.beforeEach( ( to, _from, next ) =>
{
	if ( to.matched.some( ( record ) => record.meta.hideCoverImage ) ) {
		store.commit( 'hideCoverImage' );
	}
	else {
		store.commit( 'showCoverImage' );
	}
	next();
} );
