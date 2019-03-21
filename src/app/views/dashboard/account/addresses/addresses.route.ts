import { RouteConfig } from 'vue-router';

export const routeDashAccountAddresses: RouteConfig = {
	name: 'dash.account.addresses',
	path: 'addresses',
	component: () => import(/* webpackChunkName: "routeDashAccountAddresses" */ './addresses.vue'),
};
