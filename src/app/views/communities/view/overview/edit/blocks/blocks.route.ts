import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEditBlocks: RouteConfig = {
	name: 'communities.view.overview.edit.blocks',
	path: 'blocks',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEditBlocks" */ './blocks.vue'),
};
