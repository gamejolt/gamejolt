import VueRouter from 'vue-router';

export const routeDashWithdrawFunds: VueRouter.RouteConfig = {
	name: 'dash.withdraw-funds',
	path: 'withdraw-funds',
	alias: 'developer/withdraw-funds',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashWithdrawFunds" */ './withdraw-funds'),
};
