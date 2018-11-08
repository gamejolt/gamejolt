import { RouteConfig } from 'vue-router';

export const routeDashAccountWithdrawFunds: RouteConfig = {
	name: 'dash.account.withdraw-funds',
	path: 'withdraw-funds',
	alias: 'developer/withdraw-funds',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountWithdrawFunds" */ './withdraw-funds'),
};
