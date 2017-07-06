import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthJoinAlmost: VueRouter.RouteConfig = {
	name: 'auth.join-almost',
	path: 'join/almost',
	props: true,
	component: () => asyncComponentLoader(import('./join-almost')),
	meta: {
		hideCoverImage: true,
	},
};
