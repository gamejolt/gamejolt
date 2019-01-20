import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageTags: RouteConfig = {
	name: 'dash.communities.manage.tags',
	path: 'tags',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesManageTags" */ './tags'),
};
