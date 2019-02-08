import { RouteConfig } from 'vue-router';

export const routeFlowBio: RouteConfig = {
	name: 'flow.bio',
	path: 'bio',
	component: () => import(/* webpackChunkName: "routeFlowBio" */ './bio'),
};
