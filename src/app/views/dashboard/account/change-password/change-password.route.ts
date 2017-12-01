import { RouteConfig } from 'vue-router';

export const routeDashAccountChangePassword: RouteConfig = {
	name: 'dash.account.change-password',
	path: 'change-password',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountChangePassword" */ './change-password'),
	children: [
		{
			path: '/dashboard/profile/change-password',
			redirect: { name: 'dash.account.change-password' },
		},
	],
};
