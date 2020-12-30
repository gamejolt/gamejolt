import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditCompetitionDetails } from './details/details.route';

export const routeCommunitiesViewEditCompetition: RouteConfig = {
	name: 'communities.view.edit.competition',
	path: 'competition/:compId(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditCompetition" */ './competition.vue'),
	children: [routeCommunitiesViewEditCompetitionDetails],
};
