import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountEmailPreferences: VueRouter.RouteConfig = {
	name: 'dash.account.email-preferences',
	path: 'email-preferences',
	props: true,
	component: () => asyncComponentLoader($import('./email-preferences')),
	children: [
		{
			path: '/dashboard/profile/email-preferences',
			redirect: { name: 'dash.account.email-preferences' },
		},
	],
};
