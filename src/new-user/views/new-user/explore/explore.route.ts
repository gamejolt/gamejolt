import { RouteConfig } from 'vue-router';

export const routeNewUserExplore: RouteConfig = {
	name: 'new-user.explore',
	path: 'explore',
	component: () => import(/* webpackChunkName: "routeNewUserExplore" */ './explore'),
};
