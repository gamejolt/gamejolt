import { RouteRecordRaw } from 'vue-router';

export const routeProfileTrophiesSite: RouteRecordRaw = {
	path: 'site',
	name: 'profile.trophies.site',
	component: () => import('./site.vue'),
};
