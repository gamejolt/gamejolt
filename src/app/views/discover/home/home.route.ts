import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverHome: VueRouter.RouteConfig = {
	name: 'discover.home',
	path: '',
	props: true,
	component: () => asyncComponentLoader(import('./home')),
};
