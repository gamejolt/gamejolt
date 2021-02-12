import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewChannelEntriesGrid } from './_grid/grid.route';

export const routeCommunitiesViewChannelEntries: RouteConfig = {
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewChannelCompetition" */ './entries.vue'),
	children: [routeCommunitiesViewChannelEntriesGrid],
};
