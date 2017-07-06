import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLandingAbout: VueRouter.RouteConfig = {
	name: 'landing.about',
	path: '/about',
	props: true,
	component: () => asyncComponentLoader(import('./about')),
};
