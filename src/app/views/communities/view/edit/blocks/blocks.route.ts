import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditBlocks: RouteRecordRaw = {
	name: 'communities.view.edit.blocks',
	path: 'blocks',
	component: () => import('~app/views/communities/view/edit/blocks/RouteCommunitiesViewEditBlocks.vue'),
};
