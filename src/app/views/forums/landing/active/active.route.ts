import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeForumsLandingActive: VueRouter.RouteConfig = {
	name: 'forums.landing.active',
	path: 'active',
	props: true,
	component: () => asyncComponentLoader(import('./active')),
};
