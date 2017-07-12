import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeStyleguide: VueRouter.RouteConfig = {
	name: 'styleguide',
	path: '/styleguide',
	props: true,
	component: () => asyncComponentLoader(import('./styleguide')),
};
