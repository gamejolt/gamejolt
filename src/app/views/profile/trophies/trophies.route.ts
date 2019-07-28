import { RouteConfig } from 'vue-router';

export const routeProfileTrophies: RouteConfig = {
	name: 'profile.trophies',
	path: 'trophies',
	component: () => import(/* webpackChunkName: "routeProfileTrophies" */ './trophies.vue'),
};
