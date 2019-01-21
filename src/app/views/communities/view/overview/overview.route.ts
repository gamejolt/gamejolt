import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverview: RouteConfig = {
	name: 'communities.view.overview',
	path: '/c/:path/:channel?',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewOverview" */ './overview'),
};
