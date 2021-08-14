import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountPurchasesView: RouteRecordRaw = {
	name: 'dash.account.purchases.view',
	path: 'purchases/view/:id',
	component: () => import(/* webpackChunkName: "routeDashAccountPurchasesView" */ './view.vue'),
};
