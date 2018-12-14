import { RouteConfig } from 'vue-router';

export const routeDashAccountPurchasesList: RouteConfig = {
	name: 'dash.account.purchases.list',
	path: 'purchases',
	component: () => import(/* webpackChunkName: "routeDashAccountPurchasesList" */ './list'),
};
