import { RouteConfig } from 'vue-router';

export const routeProfileTrophiesSite: RouteConfig = {
	path: 'site',
	name: 'profile.trophies.site',
	component: () => import(/* webpackChunkName: "routeProfileTrophiesSite" */ './site.vue'),
};
