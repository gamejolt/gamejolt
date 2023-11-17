import { RouteRecordRaw } from 'vue-router';

export const routeBadgeFeatured: RouteRecordRaw = {
	path: '/badge/featured/:gameId',
	component: () => import('./RouteBadgeFeatured.vue'),
};
