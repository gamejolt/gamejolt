import { RouteRecordRaw } from 'vue-router';

export const routeCheckout: RouteRecordRaw = {
	name: 'checkout',
	path: '/checkout/:orderHash',
	component: () => import('./RouteCheckout.vue'),
};
