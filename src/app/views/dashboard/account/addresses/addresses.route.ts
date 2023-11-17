import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountAddresses: RouteRecordRaw = {
	name: 'dash.account.addresses',
	path: 'addresses',
	component: () => import('./RouteDashAccountAddresses.vue'),
};
