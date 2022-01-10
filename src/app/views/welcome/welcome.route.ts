import { RouteRecordRaw } from 'vue-router';

export const routeWelcome: RouteRecordRaw = {
	name: 'welcome',
	path: '/welcome',
	component: () => import('./welcome.vue'),
	meta: {
		isFullPage: true,
	},
};
