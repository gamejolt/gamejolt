import { RouteConfig } from 'vue-router';

export const routeProfileOverview: RouteConfig = {
	name: 'profile.overview',
	path: '/@:username',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './overview'),
};
