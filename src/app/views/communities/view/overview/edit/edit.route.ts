import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEdit: RouteConfig = {
	name: 'communities.view.overview.edit',
	path: 'edit/:id(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEdit" */ './edit.vue'),
};
