import { RouteConfig } from 'vue-router';

export const routeIntent: RouteConfig = {
	name: 'intent',
	path: '/i/:action',
	component: () => import(/* webpackChunkName: "routeIntent" */ './intent.vue'),
};
