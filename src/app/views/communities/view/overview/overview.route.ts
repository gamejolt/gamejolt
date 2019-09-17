import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewOverviewEdit } from './edit/edit.route';

export const routeCommunitiesViewOverview: RouteConfig = {
	name: 'communities.view.overview',
	path: ':channel?',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverview" */ './overview.vue'),
	children: [routeCommunitiesViewOverviewEdit],
};
