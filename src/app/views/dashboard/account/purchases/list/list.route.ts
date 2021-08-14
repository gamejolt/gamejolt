import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountPurchasesList: RouteRecordRaw = {
	name: 'dash.account.purchases.list',
	path: 'purchases',
	component: () => import(/* webpackChunkName: "routeDashAccountPurchasesList" */ './list.vue'),
};
