import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountFinancials: RouteRecordRaw = {
	name: 'dash.account.financials',
	path: 'financials',
	component: () => import('./RouteDashAccountFinancials.vue'),
};
