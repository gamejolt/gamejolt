import { RouteConfig } from 'vue-router';

export const routeBasement: RouteConfig = {
	name: 'basement',
	path: '/basement',
	component: () => import(/* webpackChunkName: "routeBasement" */ './basement.vue'),
};
