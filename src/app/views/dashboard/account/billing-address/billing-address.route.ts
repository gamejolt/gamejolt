import { RouteConfig } from 'vue-router';

export const routeDashAccountBillingAddress: RouteConfig = {
	name: 'dash.account.billing-address',
	path: 'billing-address',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountBillingAddress" */ './billing-address'),
};
