import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsList: RouteRecordRaw = {
	name: 'communities.view.edit.channels.list',
	path: '',
	component: () => import('./RouteCommunitiesViewEditChannelsList.vue'),
};
