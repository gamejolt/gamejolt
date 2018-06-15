import { RouteConfig } from 'vue-router';

export const routeDashAccountAddresses: RouteConfig = {
	name: 'dash.account.addresses',
	path: 'addresses',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountAddresses" */ './addresses'),
};
