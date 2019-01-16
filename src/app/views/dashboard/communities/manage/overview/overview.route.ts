import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageOverview: RouteConfig = {
	name: 'dash.communities.manage.overview',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeDashCommunitiesManageOverview" */ './overview'),
};
