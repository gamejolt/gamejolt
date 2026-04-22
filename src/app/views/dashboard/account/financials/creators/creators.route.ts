import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountFinancialsCreators: RouteRecordRaw = {
	name: 'dash.account.financials.creators',
	path: 'creators',
	component: () =>
		import('~app/views/dashboard/account/financials/creators/RouteDashAccountFinancialsCreators.vue'),
};
