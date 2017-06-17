import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLandingMarketplace: VueRouter.RouteConfig = {
	name: 'landing.marketplace',
	path: '/marketplace',
	props: true,
	component: () => asyncComponentLoader($import('./marketplace')),
};
