import { RouteConfig } from 'vue-router';

export const routeDashAccountEmailPreferences: RouteConfig = {
	name: 'dash.account.email-preferences',
	path: 'email-preferences',
	component: () =>
		import(/* webpackChunkName: "routeDashAccountEmailPreferences" */ './email-preferences.vue'),
	children: [
		{
			path: '/dashboard/profile/email-preferences',
			redirect: { name: 'dash.account.email-preferences' },
		},
	],
};
