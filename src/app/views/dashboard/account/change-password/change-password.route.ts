import VueRouter from 'vue-router';

export const routeDashAccountChangePassword: VueRouter.RouteConfig = {
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
