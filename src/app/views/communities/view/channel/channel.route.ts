import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewChannel: RouteRecordRaw = {
	name: 'communities.view.channel',
	path: ':channel',
	component: () => import('~app/views/communities/view/channel/RouteCommunitiesViewChannel.vue'),
};
