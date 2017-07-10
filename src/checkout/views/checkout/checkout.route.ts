import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeCheckout: VueRouter.RouteConfig = {
	name: 'checkout',
	path: '/checkout/:orderId',
	props: true,
	component: () => asyncComponentLoader(import('./checkout')),
};
