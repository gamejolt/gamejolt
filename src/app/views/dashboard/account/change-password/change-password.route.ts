import { RouteConfig } from 'vue-router';

export const routeDashAccountChangePassword: RouteConfig = {
	name: 'dash.account.change-password',
	path: 'change-password',
	component: () =>
		import(/* webpackChunkName: "routeDashAccountChangePassword" */ './change-password.vue'),
	children: [
		{
			path: '/dashboard/profile/change-password',
			redirect: { name: 'dash.account.change-password' },
		},
	],
};
