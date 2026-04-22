import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsOverview: RouteRecordRaw = {
	name: 'communities.view.edit.channels.overview',
	path: '',
	component: () =>
		import('~app/views/communities/view/edit/channels/edit/overview/RouteCommunitiesViewEditChannelsOverview.vue'),
};
