import { RouteConfig } from 'vue-router';

export const routeDashLinking: RouteConfig = {
	name: 'dash.linking',
	path: 'linking',
	component: () => import(/* webpackChunkName: "routeDashLinking" */ './linking.vue'),
};
