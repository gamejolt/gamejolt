import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeActivity: VueRouter.RouteConfig = {
	name: 'activity',
	path: '/:tab(activity|notifications)',
	props: true,
	component: () => asyncComponentLoader($import('./activity')),
};
