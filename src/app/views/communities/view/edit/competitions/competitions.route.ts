import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditCompetitions: RouteConfig = {
	name: 'communities.view.edit.competitions',
	path: 'competitions',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditCompetitions" */ './competitions.vue'),
};
