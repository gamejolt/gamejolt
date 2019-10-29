import { RouteConfig } from 'vue-router';

export const routeProfileTrophiesAll: RouteConfig = {
	path: 'all',
	name: 'profile.trophies.all',
	component: () => import(/* webpackChunkName: "routeProfileTrophiesAll" */ './all.vue'),
};
