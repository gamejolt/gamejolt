import VueRouter from 'vue-router';

export const routeDashAccountFinancials: VueRouter.RouteConfig = {
	name: 'dash.account.financials',
	path: 'financials',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountFinancials" */ './financials'),
};
