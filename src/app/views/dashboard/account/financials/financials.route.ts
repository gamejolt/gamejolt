import { RouteConfig } from 'vue-router';

export const routeDashAccountFinancials: RouteConfig = {
	name: 'dash.account.financials',
	path: 'financials',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountFinancials" */ './financials'),
};
