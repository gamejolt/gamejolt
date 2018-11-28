import { RouteConfig } from 'vue-router';

export const routeDashAccountPurchasesView: RouteConfig = {
	name: 'dash.account.purchases.view',
	path: 'purchases/view/:id',
	component: () => import(/* webpackChunkName: "routeDashAccountPurchasesView" */ './view'),
};
