import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLandingLearn: VueRouter.RouteConfig = {
	name: 'landing.learn',
	path: '/learn',
	props: true,
	component: () => asyncComponentLoader($import('./learn')),
};
