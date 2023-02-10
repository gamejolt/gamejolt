import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountFinancialsCreators: RouteRecordRaw = {
	name: 'dash.account.financials.creators',
	path: 'creators',
	component: () => import('./RouteDashAccountFinancialsCreators.vue'),
};
