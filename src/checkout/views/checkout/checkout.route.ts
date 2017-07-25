import VueRouter from 'vue-router';

export const routeCheckout: VueRouter.RouteConfig = {
	name: 'checkout',
	path: '/checkout/:orderId',
	props: true,
	component: () => import(/* webpackChunkName: "routeCheckout" */ './checkout'),
};
