import { RouteRecordRaw } from 'vue-router';

export const routeKey: RouteRecordRaw = {
	name: 'key',
	path: '/claim/:accessKey([a-zA-Z0-9]+)/:bundleGameId(\\d+)?',
	component: () => import('./RouteKey.vue'),
};
