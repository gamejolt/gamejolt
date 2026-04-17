import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewEditChannelsEdit } from '~app/views/communities/view/edit/channels/edit/edit.route';
import { routeCommunitiesViewEditChannelsList } from '~app/views/communities/view/edit/channels/list/list.route';

export const routeCommunitiesViewEditChannels: RouteRecordRaw = {
	path: 'channels',
	component: () =>
		import('~app/views/communities/view/edit/channels/RouteCommunitiesViewEditChannels.vue'),
	children: [routeCommunitiesViewEditChannelsList, routeCommunitiesViewEditChannelsEdit],
};
