import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEditModerators: RouteConfig = {
	name: 'communities.view.overview.edit.moderators',
	path: 'moderators',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewOverviewEditModerators" */ './moderators.vue'
		),
};
