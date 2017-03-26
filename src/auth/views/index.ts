import Vue from 'vue';
import VueRouter from 'vue-router';

import { routeAuth } from './auth/auth.route';
import { store, Mutations } from '../store/index';

Vue.use( VueRouter );

export async function routeResolve( promise: Promise<any>, next: Function )
{
	const payload = await promise;
	next( ( vm: any ) =>
	{
		vm.payload = payload;
		vm.onRoute();
	} );
}

const routes = [
	routeAuth,
];

export const router = new VueRouter( {
	mode: 'history',
	routes,
} );

router.beforeEach( ( to, _from, next ) =>
{
	if ( to.matched.some( ( record ) => record.meta.hideCoverImage ) ) {
		store.commit( Mutations.hideCoverImage );
	}
	else {
		store.commit( Mutations.showCoverImage );
	}
	next();
} );
