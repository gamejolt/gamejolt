import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEditDetails: RouteConfig = {
	name: 'communities.view.overview.edit.details',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEditDetails" */ './details.vue'),
};
