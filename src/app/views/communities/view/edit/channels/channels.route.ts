import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditChannelsEdit } from './edit/edit.route';
import { routeCommunitiesViewEditChannelsList } from './list/list.route';

export const routeCommunitiesViewEditChannels: RouteConfig = {
	path: 'channels',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './channels.vue'),
	children: [routeCommunitiesViewEditChannelsList, routeCommunitiesViewEditChannelsEdit],
};
