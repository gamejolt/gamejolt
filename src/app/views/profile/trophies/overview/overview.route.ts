import { RouteConfig } from 'vue-router';

export const routeProfileTrophiesOverview: RouteConfig = {
	path: '',
	name: 'profile.trophies',
	component: () =>
		import(/* webpackChunkName: "routeProfileTrophiesOverview" */ './overview.vue'),
};
