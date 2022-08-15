import { RouteRecordRaw } from 'vue-router';
import { routeCommunitiesViewChannel } from './channel/channel.route';
import { routeCommunitiesViewEdit } from './edit/edit.route';
import { routeCommunitiesViewFiresides } from './firesides/firesides.route';
import { routeCommunitiesViewMembers } from './members/members.route';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const routeCommunitiesView: RouteRecordRaw = {
	path: '/c/:path',
	component: () => import('./RouteCommunitiesView.vue'),
	// The order matters here since channels will take any URL path.
	children: [
		routeCommunitiesViewMembers,
		routeCommunitiesViewFiresides,
		routeCommunitiesViewOverview,
		routeCommunitiesViewChannel,
		routeCommunitiesViewEdit,
	],
};
