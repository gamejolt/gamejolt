import { RouteConfig } from 'vue-router';

export const routeDashLinking: RouteConfig = {
	name: 'dash.linking',
	path: 'linking',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashLinking" */ './linking'),
};
