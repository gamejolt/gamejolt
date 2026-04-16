import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewChannel } from '~app/views/communities/view/channel/channel.route';
import { routeCommunitiesViewEdit } from '~app/views/communities/view/edit/edit.route';
import { routeCommunitiesViewMembers } from '~app/views/communities/view/members/members.route';
import { routeCommunitiesViewOverview } from '~app/views/communities/view/overview/overview.route';

export const routeCommunitiesView: RouteRecordRaw = {
	path: '/c/:path',
	component: () => import('~app/views/communities/view/RouteCommunitiesView.vue'),
	// The order matters here since channels will take any URL path.
	children: [
		routeCommunitiesViewMembers,
		routeCommunitiesViewOverview,
		routeCommunitiesViewChannel,
		routeCommunitiesViewEdit,
	],
};
