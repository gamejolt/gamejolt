import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthAuthorize: VueRouter.RouteConfig = {
	name: 'auth.authorize',
	path: 'authorize/:userId/:code/:type',
	props: true,
	component: () => asyncComponentLoader(import('./authorize')),
	meta: {
		hideCoverImage: true,
	},
};
