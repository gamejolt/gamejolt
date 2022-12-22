import { RouteRecordRaw } from 'vue-router';

export const routeDashReferrals: RouteRecordRaw = {
	name: 'dash.referrals',
	path: 'referrals',
	component: () => import('./RouteDashReferrals.vue'),
};
