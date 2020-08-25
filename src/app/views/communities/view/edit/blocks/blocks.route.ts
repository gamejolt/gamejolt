import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditBlocks: RouteConfig = {
	name: 'communities.view.edit.blocks',
	path: 'blocks',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './blocks.vue'),
};
