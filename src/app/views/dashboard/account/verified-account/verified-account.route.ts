import { RouteConfig } from 'vue-router';

export const routeDashAccountVerifiedAccount: RouteConfig = {
	name: 'dash.account.verified-account',
	path: 'verified-account',
	alias: 'developer/verified-account',
	component: () =>
		import(/* webpackChunkName: "routeDashAccountVerifiedAccount" */ './verified-account.vue'),
};
