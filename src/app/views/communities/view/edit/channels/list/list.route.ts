import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsList: RouteRecordRaw = {
	name: 'communities.view.edit.channels.list',
	path: '',
	component: () =>
		import('~app/views/communities/view/edit/channels/list/RouteCommunitiesViewEditChannelsList.vue'),
};
