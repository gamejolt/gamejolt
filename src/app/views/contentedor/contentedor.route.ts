import { RouteConfig } from 'vue-router';

export const routeContentedor: RouteConfig = {
	name: 'contentedor',
	path: '/contentedor',
	component: () => import(/* webpackChunkName: "routeContentidor" */ './contentedor.vue'),
};
