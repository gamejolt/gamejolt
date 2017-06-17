import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLinkedAccountTwitchCallback: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitch.callback',
	path: 'twitch/callback',
	props: true,
	component: () => asyncComponentLoader($import('./callback')),
};
