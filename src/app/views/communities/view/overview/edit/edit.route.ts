import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewOverviewEditChannels } from './channels/channels.route';
import { routeCommunitiesViewOverviewEditDetails } from './details/details.route';
import { routeCommunitiesViewOverviewEditModerators } from './moderators/moderators.route';

export const routeCommunitiesViewOverviewEdit: RouteConfig = {
	path: 'edit/:id(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEdit" */ './edit.vue'),
	children: [
		routeCommunitiesViewOverviewEditDetails,
		routeCommunitiesViewOverviewEditChannels,
		routeCommunitiesViewOverviewEditModerators,
	],
};
