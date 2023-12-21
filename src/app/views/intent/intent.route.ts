import { RouteRecordRaw } from 'vue-router';

export const routeIntent: RouteRecordRaw = {
	name: 'intent',
	path: '/i/:action',
	component: () => import('./RouteIntent.vue'),
};
