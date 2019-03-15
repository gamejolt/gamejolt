import { RouteConfig } from 'vue-router';

export const routePlayboxUnloaded: RouteConfig = {
	name: 'playbox.unloaded',
	path: '/playbox/unloaded',
	component: () => import(/* webpackChunkName: "routePlayboxUnloaded" */ './unloaded'),
};
