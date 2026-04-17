import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditDetails: RouteRecordRaw = {
	name: 'communities.view.edit.details',
	path: '',
	component: () =>
		import('~app/views/communities/view/edit/details/RouteCommunitiesViewEditDetails.vue'),
};
