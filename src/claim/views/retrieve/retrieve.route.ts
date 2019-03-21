import { RouteConfig } from 'vue-router';

export const routeRetrieve: RouteConfig = {
	name: 'retrieve',
	path: '/claim/:input([gb]{1}\\-[0-9a-zA-Z]+)?',
	component: () => import(/* webpackChunkName: "routeRetrieve" */ './retrieve.vue'),
};
