import { RouteConfig } from 'vue-router';

export const routeAuthJoin: RouteConfig = {
	name: 'auth.join',
	path: 'join',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthJoin" */ './join'),
};
