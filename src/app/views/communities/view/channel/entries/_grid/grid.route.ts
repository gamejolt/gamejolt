import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewChannelEntriesGrid: RouteConfig = {
	name: 'communities.view.channel.entries',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewChannelCompetition" */ './grid.vue'),
};
