import { RouteRecordRaw } from 'vue-router';

export const routeForumsLandingActive: RouteRecordRaw = {
	name: 'forums.landing.active',
	path: 'active',
	component: () => import('./RouteForumsLandingActive.vue'),
};
