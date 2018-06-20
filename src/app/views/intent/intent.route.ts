import { RouteConfig } from 'vue-router';

export const routeIntent: RouteConfig = {
	name: 'intent',
	path: '/i/:action',
	props: true,
	component: () => import(/* webpackChunkName: "routeIntent" */ './intent'),
};
