import { RouteRecordRaw } from 'vue-router';
import { routeCommunitiesViewEditChannelsEdit } from './edit/edit.route';
import { routeCommunitiesViewEditChannelsList } from './list/list.route';

export const routeCommunitiesViewEditChannels: RouteRecordRaw = {
	path: 'channels',
	component: () => import('./channels.vue'),
	children: [routeCommunitiesViewEditChannelsList, routeCommunitiesViewEditChannelsEdit],
};
