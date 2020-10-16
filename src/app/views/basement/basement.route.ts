import { RouteConfig } from 'vue-router';

export const routeBasement: RouteConfig = {
	path: '/basement',
	component: () => import(/* webpackChunkName: "routeBasement" */ './basement.vue'),
};
