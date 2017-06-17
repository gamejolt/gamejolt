import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountChangePassword: VueRouter.RouteConfig = {
	name: 'dash.account.change-password',
	path: 'change-password',
	props: true,
	component: () => asyncComponentLoader($import('./change-password')),
	children: [
		{
			path: '/dashboard/profile/change-password',
			redirect: { name: 'dash.account.change-password' },
		},
	],
};
