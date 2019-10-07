import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEditChannels: RouteConfig = {
	name: 'communities.view.overview.edit.channels',
	path: 'channels',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEditChannels" */ './channels.vue'),
};
