import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountWallet: RouteRecordRaw = {
	name: 'dash.account.wallet',
	path: 'wallet',
	component: () => import('./RouteDashAccountWallet.vue'),
};
