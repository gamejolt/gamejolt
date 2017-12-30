import { RouteConfig } from 'vue-router';

export const routeCheckout: RouteConfig = {
	name: 'checkout',
	path: '/checkout/:orderId',
	props: true,
	component: () => import(/* webpackChunkName: "routeCheckout" */ './checkout'),
};
