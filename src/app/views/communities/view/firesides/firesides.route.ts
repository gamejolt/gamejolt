import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewFiresides: RouteConfig = {
	name: 'communities.view.firesides',
	path: 'firesides',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewFiresides" */ './firesides.vue'),
};
