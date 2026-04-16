import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountPurchasesView: RouteRecordRaw = {
	name: 'dash.account.purchases.view',
	path: 'purchases/view/:hash',
	component: () => import('~app/views/dashboard/account/purchases/view/RouteDashAccountPurchasesView.vue'),
};
