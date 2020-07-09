import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverview: RouteConfig = {
	name: 'communities.view.overview',
	path: '/c/:path',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverview" */ './overview.vue'),
	meta: {
		contextPane: 'channels',
	},
};
