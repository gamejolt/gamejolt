import { RouteConfig } from 'vue-router';

export const routeDashMainPurchasesView: RouteConfig = {
	name: 'dash.main.purchases.view',
	path: 'purchases/view/:id',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainPurchasesView" */ './view'),
};
