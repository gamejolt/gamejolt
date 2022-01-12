import { RouteRecordRaw } from 'vue-router';

export const routeCheckout: RouteRecordRaw = {
	name: 'checkout',
	path: '/checkout/:orderId',
	component: () => import('./checkout.vue'),
};
