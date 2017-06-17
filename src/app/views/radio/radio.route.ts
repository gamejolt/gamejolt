import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeRadio: VueRouter.RouteConfig = {
	name: 'radio',
	path: '/radio',
	props: true,
	component: () => asyncComponentLoader($import('./radio')),
};
