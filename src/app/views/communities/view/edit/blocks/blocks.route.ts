import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditBlocks: RouteRecordRaw = {
	name: 'communities.view.edit.blocks',
	path: 'blocks',
	component: () => import('./RouteCommunitiesViewEditBlocks.vue'),
};
