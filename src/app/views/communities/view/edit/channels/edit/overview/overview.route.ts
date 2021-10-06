import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsOverview: RouteConfig = {
	name: 'communities.view.edit.channels.overview',
	path: '/c/:path/edit/:id(\\d+)/channels/:channel',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditChannel" */ './overview.vue'),
};
