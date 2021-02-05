import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsOverview: RouteConfig = {
	name: 'communities.view.edit.channels.overview',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditChannel" */ './overview.vue'),
};
