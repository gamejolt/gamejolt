import { RouteRecordRaw } from 'vue-router';

export const routeWelcome: RouteRecordRaw = {
	name: 'welcome',
	path: '/welcome',
	component: () => import('~app/views/welcome/RouteWelcome.vue'),
	meta: {
		isFullPage: true,
	},
};
