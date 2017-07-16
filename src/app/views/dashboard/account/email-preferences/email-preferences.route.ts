import VueRouter from 'vue-router';

export const routeDashAccountEmailPreferences: VueRouter.RouteConfig = {
	name: 'dash.account.email-preferences',
	path: 'email-preferences',
	props: true,
	component: () => import('./email-preferences'),
	children: [
		{
			path: '/dashboard/profile/email-preferences',
			redirect: { name: 'dash.account.email-preferences' },
		},
	],
};
