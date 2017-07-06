import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLibraryOverview: VueRouter.RouteConfig = {
	name: 'library.overview',
	path: '/library',
	props: true,
	component: () => asyncComponentLoader(import('./overview')),
};
