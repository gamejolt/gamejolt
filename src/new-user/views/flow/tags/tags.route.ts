import { RouteConfig } from 'vue-router';

export const routeFlowTags: RouteConfig = {
	name: 'flow.tags',
	path: 'tags',
	component: () => import(/* webpackChunkName: "routeFlowTags" */ './tags'),
};
