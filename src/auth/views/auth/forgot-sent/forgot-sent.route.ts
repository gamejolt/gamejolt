import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthForgotSent: VueRouter.RouteConfig = {
	name: 'auth.forgot-sent',
	path: 'forgot/sent',
	props: true,
	component: () => asyncComponentLoader($import('./forgot-sent')),
	meta: {
		hideCoverImage: true,
	},
};
