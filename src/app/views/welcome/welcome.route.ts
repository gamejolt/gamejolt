import { RouteRecordRaw } from 'vue-router';

export const routeWelcome: RouteRecordRaw = {
	name: 'welcome',
	path: '/welcome',
	component: () => import(/* webpackChunkName: "routeWelcome" */ './welcome.vue'),
	meta: {
		isFullPage: true,
	},
};
