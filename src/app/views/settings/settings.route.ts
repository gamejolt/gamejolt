import { RouteConfig } from 'vue-router';

export const routeSettings: RouteConfig = {
	name: 'settings',
	path: '/settings',
	props: true,
	component: () => import(/* webpackChunkName: "routeSettings" */ './settings'),
	meta: {
		availableOffline: true,
	},
};
