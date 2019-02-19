import { RouteConfig } from 'vue-router';

export const routeNewUserBio: RouteConfig = {
	name: 'new-user.bio',
	path: 'bio',
	component: () => import(/* webpackChunkName: "routeNewUserBio" */ './bio'),
};
