import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewChannelEntriesGrid } from './_grid/grid.route';

export const routeCommunitiesViewChannelEntries: RouteConfig = {
	path: 'entries',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewChannelCompetition" */ './entries.vue'),
	children: [routeCommunitiesViewChannelEntriesGrid],
};
