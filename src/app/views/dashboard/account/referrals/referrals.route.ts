import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountReferrals: RouteRecordRaw = {
	name: 'dash.account.referrals',
	path: 'referrals',
	component: () => import('~app/views/dashboard/account/referrals/RouteDashAccountReferrals.vue'),
};
