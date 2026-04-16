import { RouteRecordRaw } from 'vue-router';

export const routeCheckout: RouteRecordRaw = {
	name: 'checkout',
	path: '/checkout/:orderHash',
	component: () => import('~checkout/views/checkout/RouteCheckout.vue'),
};
