import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeSearchResults: VueRouter.RouteConfig = {
	name: 'search.results',
	path: '/search',
	props: true,
	component: () => asyncComponentLoader(import('./results')),
};
