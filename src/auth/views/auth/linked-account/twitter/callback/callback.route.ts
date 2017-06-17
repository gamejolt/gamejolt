import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLinkedAccountTwitterCallback: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitter.callback',
	path: 'twitter/callback',
	props: true,
	component: () => asyncComponentLoader($import('./callback')),
};
