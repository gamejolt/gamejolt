import { RouteConfig } from 'vue-router';

export const routeAuthJoin: RouteConfig = {
	name: 'auth.join',
	path: 'join',
	component: () => import(/* webpackChunkName: "routeAuthJoin" */ './join'),
};
