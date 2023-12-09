import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountEmailPreferences: RouteRecordRaw = {
	name: 'dash.account.email-preferences',
	path: 'email-preferences',
	component: () => import('./RouteDashAccountEmailPreferences.vue'),
	children: [
		{
			path: '/dashboard/profile/email-preferences',
			redirect: { name: 'dash.account.email-preferences' },
		},
	],
};
