import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditModerators: RouteRecordRaw = {
	name: 'communities.view.edit.moderators',
	path: 'moderators',
	component: () => import('~app/views/communities/view/edit/moderators/RouteCommunitiesViewEditModerators.vue'),
};
