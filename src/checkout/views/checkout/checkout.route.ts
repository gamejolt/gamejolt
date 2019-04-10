import { RouteConfig } from 'vue-router';

export const routeCheckout: RouteConfig = {
	name: 'checkout',
	path: '/checkout/:orderId',
	component: () => import(/* webpackChunkName: "routeCheckout" */ './checkout.vue'),
};
