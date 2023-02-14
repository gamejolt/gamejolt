import { RouteRecordRaw } from 'vue-router';
import { routeDashAccountFinancialsCreators } from './creators/creators.route';
import { routeDashAccountFinancialsMarketplace } from './marketplace/marketplace.route';

export const routeDashAccountFinancials: RouteRecordRaw = {
	name: 'dash.account.financials',
	path: 'financials',
	component: () => import('./RouteDashAccountFinancials.vue'),
	children: [routeDashAccountFinancialsCreators, routeDashAccountFinancialsMarketplace],
};
