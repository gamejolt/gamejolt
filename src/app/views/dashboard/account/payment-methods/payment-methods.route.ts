import { RouteConfig } from 'vue-router';

export const routeDashAccountPaymentMethods: RouteConfig = {
	name: 'dash.account.payment-methods',
	path: 'payment-methods',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountPaymentMethods" */ './payment-methods'),
};
