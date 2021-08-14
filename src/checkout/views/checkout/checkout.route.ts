import { RouteRecordRaw } from 'vue-router';

export const routeCheckout: RouteRecordRaw = {
	name: 'checkout',
	path: '/checkout/:orderId',
	component: () => import(/* webpackChunkName: "routeCheckout" */ './checkout.vue'),
};
