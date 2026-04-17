import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountAddresses: RouteRecordRaw = {
	name: 'dash.account.addresses',
	path: 'addresses',
	component: () => import('~app/views/dashboard/account/addresses/RouteDashAccountAddresses.vue'),
};
