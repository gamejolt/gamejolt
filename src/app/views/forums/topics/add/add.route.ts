import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeForumsTopicsAdd: VueRouter.RouteConfig = {
	name: 'forums.topics.add',
	path: '/f/:channel/create',
	props: true,
	component: () => asyncComponentLoader($import('./add')),
};
