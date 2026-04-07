import { RouteRecordRaw } from 'vue-router';

export const routeProfileTrophiesAll: RouteRecordRaw = {
	path: 'all',
	name: 'profile.trophies.all',
	component: () => import('./RouteProfileTrophiesAll.vue'),
};
