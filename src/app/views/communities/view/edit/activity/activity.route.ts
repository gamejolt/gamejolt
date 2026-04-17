import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditActivity: RouteRecordRaw = {
	name: 'communities.view.edit.activity',
	path: 'log',
	component: () =>
		import('~app/views/communities/view/edit/activity/RouteCommunitiesViewEditActivity.vue'),
};
