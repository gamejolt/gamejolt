import { RouteConfig } from 'vue-router';

export const routeDashWithdrawFunds: RouteConfig = {
	name: 'dash.withdraw-funds',
	path: 'withdraw-funds',
	alias: 'developer/withdraw-funds',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashWithdrawFunds" */ './withdraw-funds'),
};
