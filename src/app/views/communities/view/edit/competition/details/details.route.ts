import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditCompetitionDetails: RouteConfig = {
	name: 'communities.view.edit.competition.details',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditCompetition" */ './details.vue'),
};
