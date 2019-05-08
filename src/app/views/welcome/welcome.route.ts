import { RouteConfig } from 'vue-router';

export const routeWelcome: RouteConfig = {
	name: 'welcome',
	path: '/welcome',
	component: () => import(/* webpackChunkName: "routeWelcome" */ './welcome.vue'),
	meta: {
		isFullPage: true,
	},
};
