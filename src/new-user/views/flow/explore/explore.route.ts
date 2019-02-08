import { RouteConfig } from 'vue-router';

export const routeFlowExplore: RouteConfig = {
	name: 'flow.explore',
	path: 'explore',
	component: () => import(/* webpackChunkName: "routeFlowExplore" */ './explore'),
};
