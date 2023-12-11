import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountLinkedAccounts: RouteRecordRaw = {
	name: 'dash.account.linked-accounts',
	path: 'linked-accounts',
	component: () => import('./RouteDashAccountLinkedAccounts.vue'),
};
