import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountChangePassword: RouteRecordRaw = {
	name: 'dash.account.change-password',
	path: 'change-password',
	component: () => import('./RouteDashAccountChangePassword.vue'),
	children: [
		{
			path: '/dashboard/profile/change-password',
			redirect: { name: 'dash.account.change-password' },
		},
	],
};
