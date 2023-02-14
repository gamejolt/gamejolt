import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountFinancialsMarketplace: RouteRecordRaw = {
	name: 'dash.account.financials.marketplace',
	path: 'marketplace',
	component: () => import('./RouteDashAccountFinancialsMarketplace.vue'),
};
