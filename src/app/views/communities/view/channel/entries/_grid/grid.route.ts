import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewChannelEntriesGrid: RouteConfig = {
	name: 'communities.view.channel.entries',
	path: 'entries',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewChannelCompetition" */ './grid.vue'),
};
