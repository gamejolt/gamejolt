import { RouteRecordRaw } from 'vue-router';

import { routeDashAccountFinancialsCreators } from '~app/views/dashboard/account/financials/creators/creators.route';
import { routeDashAccountFinancialsMarketplace } from '~app/views/dashboard/account/financials/marketplace/marketplace.route';

export const routeDashAccountFinancials: RouteRecordRaw = {
	name: 'dash.account.financials',
	path: 'financials',
	component: () => import('~app/views/dashboard/account/financials/RouteDashAccountFinancials.vue'),
	children: [routeDashAccountFinancialsCreators, routeDashAccountFinancialsMarketplace],
};
